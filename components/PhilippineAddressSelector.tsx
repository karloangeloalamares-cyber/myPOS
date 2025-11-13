"use client";

import React, { useEffect, useMemo, useState } from "react";

export type Region = { region_code: string; region_name: string };
export type Province = {
  province_code: string;
  province_name: string;
  region_code: string;
};
export type City = { city_code: string; city_name: string; province_code: string };
export type Barangay = { brgy_code: string; brgy_name: string; city_code: string };

export type AddressValue = {
  region?: Region;
  province?: Province;
  city?: City;
  barangay?: Barangay;
};

export type Props = {
  value?: AddressValue;
  onChange?: (value: AddressValue) => void;
};

export default function PhilippineAddressSelector({ value, onChange }: Props) {
  // Respect Vite base path when constructing asset URLs
  const baseUrl = ((import.meta as any)?.env?.BASE_URL as string) || '/';
  const buildUrl = (p: string) => `${String(baseUrl).replace(/\/$/, '')}/${p.replace(/^\//, '')}`;
  const cacheBust = useMemo(() => String(Date.now()), []);
  const [regionCode, setRegionCode] = useState<string>(value?.region?.region_code ?? "");
  const [provinceCode, setProvinceCode] = useState<string>(value?.province?.province_code ?? "");
  const [cityCode, setCityCode] = useState<string>(value?.city?.city_code ?? "");
  const [barangayCode, setBarangayCode] = useState<string>(value?.barangay?.brgy_code ?? "");

  const [regions, setRegions] = useState<Region[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);

  useEffect(() => {
    const loadRegions = async () => {
      try {
        const res = await fetch(`${buildUrl("ph-addresses/region.json")}?v=${cacheBust}` , { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch regions: ${res.status}`);
        const data = (await res.json()) as Region[];
        setRegions(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadRegions();
  }, []);

  useEffect(() => {
    const loadProvinces = async () => {
      try {
        const res = await fetch(`${buildUrl("ph-addresses/province.json")}?v=${cacheBust}` , { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch provinces: ${res.status}`);
        const data = (await res.json()) as Province[];
        const filtered = data.filter((p) => p.region_code === regionCode);
        setProvinces(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    if (!regionCode) {
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      setProvinceCode("");
      setCityCode("");
      setBarangayCode("");
      return;
    }

    setProvinceCode("");
    setCityCode("");
    setBarangayCode("");
    setCities([]);
    setBarangays([]);
    loadProvinces();
  }, [regionCode]);

  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await fetch(`${buildUrl("ph-addresses/city.json")}?v=${cacheBust}` , { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch cities: ${res.status}`);
        const data = (await res.json()) as City[];
        const filtered = data.filter((c) => c.province_code === provinceCode);
        setCities(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    if (!provinceCode) {
      setCities([]);
      setBarangays([]);
      setCityCode("");
      setBarangayCode("");
      return;
    }

    setCityCode("");
    setBarangayCode("");
    setBarangays([]);
    loadCities();
  }, [provinceCode]);

  useEffect(() => {
    const loadBarangays = async () => {
      try {
        const res = await fetch(`${buildUrl("ph-addresses/barangay.json")}?v=${cacheBust}` , { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to fetch barangays: ${res.status}`);
        const data = (await res.json()) as Barangay[];
        const filtered = data.filter((b) => b.city_code === cityCode);
        setBarangays(filtered);
      } catch (err) {
        console.error(err);
      }
    };

    if (!cityCode) {
      setBarangays([]);
      setBarangayCode("");
      return;
    }

    setBarangayCode("");
    loadBarangays();
  }, [cityCode]);

  useEffect(() => {
    if (!onChange) return;
    const region = regions.find((r) => r.region_code === regionCode);
    const province = provinces.find((p) => p.province_code === provinceCode);
    const city = cities.find((c) => c.city_code === cityCode);
    const barangay = barangays.find((b) => b.brgy_code === barangayCode);
    onChange({ region, province, city, barangay });
  }, [regionCode, provinceCode, cityCode, barangayCode, regions, provinces, cities, barangays, onChange]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">Region</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={regionCode}
          onChange={(e) => setRegionCode(e.target.value)}
        >
          <option value="">Select region</option>
          {regions.map((r) => (
            <option key={r.region_code} value={r.region_code}>
              {r.region_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Province</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={provinceCode}
          onChange={(e) => setProvinceCode(e.target.value)}
          disabled={!regionCode}
        >
          <option value="">Select province</option>
          {provinces.map((p) => (
            <option key={p.province_code} value={p.province_code}>
              {p.province_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">City / Municipality</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={cityCode}
          onChange={(e) => setCityCode(e.target.value)}
          disabled={!provinceCode}
        >
          <option value="">Select city / municipality</option>
          {cities.map((c) => (
            <option key={c.city_code} value={c.city_code}>
              {c.city_name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Barangay</label>
        <select
          className="w-full border rounded px-2 py-1"
          value={barangayCode}
          onChange={(e) => setBarangayCode(e.target.value)}
          disabled={!cityCode}
        >
          <option value="">Select barangay</option>
          {barangays.map((b) => (
            <option key={b.brgy_code} value={b.brgy_code}>
              {b.brgy_name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/*
// Example usage:
// import React, { useState } from "react";
// import PhilippineAddressSelector, { AddressValue } from "./PhilippineAddressSelector";
//
// function ExampleForm() {
//   const [address, setAddress] = useState<AddressValue>({});
//   return (
//     <PhilippineAddressSelector
//       value={address}
//       onChange={setAddress}
//     />
//   );
// }
*/
