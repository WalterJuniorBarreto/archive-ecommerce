export interface UbigeoItem {
  id: string;
  name: string;
  department_id?: string;
  province_id?: string;
}

export const ubigeoService = {

  getDepartamentos: async (): Promise<UbigeoItem[]> => {
    const importedData = await import('../data/ubigeo_peru_2016_departamentos.json');
    return importedData.default as UbigeoItem[];
  },

  getProvincias: async (departmentId: string): Promise<UbigeoItem[]> => {
    const importedData = await import('../data/ubigeo_peru_2016_provincias.json');
    const allProvincias = importedData.default as UbigeoItem[];
    
    return allProvincias.filter((p) => 
      p.department_id === departmentId || p.id.startsWith(departmentId)
    );
  },

  getDistritos: async (provinceId: string): Promise<UbigeoItem[]> => {
    const importedData = await import('../data/ubigeo_peru_2016_distritos.json');
    const allDistritos = importedData.default as UbigeoItem[];

    return allDistritos.filter((d) => 
      d.province_id === provinceId || d.id.startsWith(provinceId)
    );
  }
};