export interface Departamento {
  id: string;
  name: string;
  provinces: Provincia[];
}

export interface Provincia {
  id: string;
  name: string;
  districts: Distrito[];
}

export interface Distrito {
  id: string;
  name: string;
}
