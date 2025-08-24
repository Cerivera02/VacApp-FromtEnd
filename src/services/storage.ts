class StorageService {
  private key = "app_data";

  private getStorage(): Record<string, any> {
    const data = localStorage.getItem(this.key);
    try {
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  private setStorage(data: Record<string, any>) {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  // 🔹 Convierte path "user.username" en objeto anidado y mergea
  set(path: string, value: any) {
    const data = this.getStorage();
    const keys = path.split(".");
    let obj = data;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        obj[key] = value; // último nivel, asigna valor
      } else {
        if (!obj[key] || typeof obj[key] !== "object") {
          obj[key] = {};
        }
        obj = obj[key]; // desciende al siguiente nivel
      }
    });

    this.setStorage(data);
  }

  // 🔹 Leer valor de path "user.username"
  get(path: string): any {
    const data = this.getStorage();
    const keys = path.split(".");
    let obj: any = data;

    for (const key of keys) {
      if (obj == null) return undefined;
      obj = obj[key];
    }

    return obj;
  }

  // 🔹 Eliminar propiedad específica por path
  remove(path: string) {
    const data = this.getStorage();
    const keys = path.split(".");
    let obj: any = data;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        delete obj[key];
      } else {
        if (!obj[key]) return;
        obj = obj[key];
      }
    });

    this.setStorage(data);
  }

  clear() {
    localStorage.removeItem(this.key);
  }

  // 🔹 Métodos específicos para datos de vacas
  saveVacaData(vacaId: number, data: any) {
    this.set(`vacas.${vacaId}`, data);
  }

  getVacaData(vacaId: number): any {
    return this.get(`vacas.${vacaId}`);
  }

  clearVacaData(vacaId: number) {
    this.remove(`vacas.${vacaId}`);
  }

  // 🔹 Obtener todas las vacas del storage
  getAllVacasData(): Record<string, any> {
    return this.get("vacas") || {};
  }

  // 🔹 Métodos específicos para datos de marcas
  saveMarcaData(marcaId: number, data: any) {
    this.set(`marcas.${marcaId}`, data);
  }

  getMarcaData(marcaId: number): any {
    return this.get(`marcas.${marcaId}`);
  }

  clearMarcaData(marcaId: number) {
    this.remove(`marcas.${marcaId}`);
  }

  // 🔹 Obtener todas las marcas del storage
  getAllMarcasData(): Record<string, any> {
    return this.get("marcas") || {};
  }

  // 🔹 Limpiar todas las marcas del storage
  clearAllMarcasData() {
    this.remove("marcas");
  }
}

export const storage = new StorageService();
