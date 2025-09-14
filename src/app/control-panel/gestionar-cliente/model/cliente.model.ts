export class Cliente {
    constructor(
        public idCliente: number,
        public codigoCliente: string,
        public nombre: string,
        public apellido: string,
        public correo: string,
        public celular: string,
        public doc: string,
        public direccion: string,
        public estado: string,
        public ECli_Nombre: string,
    ) { }
}