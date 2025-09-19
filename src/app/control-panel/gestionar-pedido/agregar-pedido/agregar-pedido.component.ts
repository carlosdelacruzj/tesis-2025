import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PedidoService } from '../service/pedido.service';
import { VisualizarService } from '../service/visualizar.service';
import swal from 'sweetalert2';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Time } from '@angular/common';

type Tag = { nombre: string; direccion: string; usedAt?: number };

@Component({
  selector: 'app-agregar-pedido',
  templateUrl: './agregar-pedido.component.html',
  styleUrls: ['./agregar-pedido.component.css']
})
export class AgregarPedidoComponent implements OnInit {

  // columnas (eventos)
  columnsToDisplay = ['Nro', 'Fecha', 'Hora', 'Direccion', 'DireccionExacta', 'Notas', 'Editar', 'Quitar'];
  // columnas (paquetes)
  columnsToDisplay1 = ['Descripcion', 'Precio', 'Seleccionar'];

  eventoxsevicio: any[] = [];
  servicios: any[] = [];
  servicioSeleccionado = 1;
  eventoSeleccionado = 1;
  CodigoEmpleado: number = 1;
  evento: any[] = [];
  dataSource!: MatTableDataSource<any>;
  dataSource1!: MatTableDataSource<any>;
  desID = 0;

  infoCliente = { nombre: '-', apellido: '-' };
  dniCliente: any;

  Direccion: any;
  DireccionExacta: string = '';
  NotasEvento: string = '';

  fechaCreate: Date = new Date();
  minimo: string;
  maximo: string;

  ubicacion = [{ ID: 0, Direccion: '', Fecha: '', Hora: '', DireccionExacta: '', Notas: '' }];

  lat: any;
  lng: any;

  selectedDescripcion: any;

  // ====== TAGS (solo front) ======
  tagsPedido: Tag[] = [];   // visibles solo mientras armas este pedido
  tagsCliente: Tag[] = [];  // persistentes por cliente en este navegador

  constructor(public pedidoService: PedidoService, public visualizarService: VisualizarService,) { }

  // ====== Helpers Tags ======
  get tagStorageKey(): string {
    return `ubicTags:${this.dniCliente || 'anon'}`;
  }

  private norm(s: string): string {
    return (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
  }
  private findTagIndexByNombre(arr: Tag[], nombre: string): number {
    const n = this.norm(nombre);
    return arr.findIndex(t => this.norm(t.nombre) === n);
  }


  get canGuardarTag(): boolean {
    const u = this.norm(this.Direccion);
    const dx = (this.DireccionExacta || '').trim();
    return !!(u && dx && dx.length >= 8);
  }

  loadTagsCliente() {
    try {
      const raw = localStorage.getItem(this.tagStorageKey);
      this.tagsCliente = raw ? JSON.parse(raw) : [];
    } catch { this.tagsCliente = []; }
  }

  saveTagsCliente() {
    // cap de items
    const max = 12;
    const arr = this.tagsCliente
      .sort((a: Tag, b: Tag) => (b.usedAt || 0) - (a.usedAt || 0))
      .slice(0, max);
    localStorage.setItem(this.tagStorageKey, JSON.stringify(arr));
  }

  saveTag(scope: 'pedido' | 'cliente') {
    if (!this.canGuardarTag) return;

    const nombre = (this.Direccion || '').trim();
    const direccion = (this.DireccionExacta || '').trim();
    const now = Date.now();

    if (scope === 'pedido') {
      const idx = this.findTagIndexByNombre(this.tagsPedido, nombre);
      if (idx >= 0) {
        // actualizar dirección y usedAt, y llevar al frente
        this.tagsPedido[idx] = { ...this.tagsPedido[idx], direccion, usedAt: now };
        const updated = this.tagsPedido.splice(idx, 1)[0];
        this.tagsPedido.unshift(updated);
      } else {
        this.tagsPedido.unshift({ nombre, direccion, usedAt: now });
      }
    } else {
      const idx = this.findTagIndexByNombre(this.tagsCliente, nombre);
      if (idx >= 0) {
        this.tagsCliente[idx] = { ...this.tagsCliente[idx], direccion, usedAt: now };
        const updated = this.tagsCliente.splice(idx, 1)[0];
        this.tagsCliente.unshift(updated);
      } else {
        this.tagsCliente.unshift({ nombre, direccion, usedAt: now });
      }
      this.saveTagsCliente();
    }
  }


  applyTag(tag: Tag) {
    this.Direccion = tag.nombre;
    this.DireccionExacta = tag.direccion;
    // marca uso reciente
    tag.usedAt = Date.now();
    this.tagsCliente = [...this.tagsCliente]; // trigger change detection si corresponde
    this.saveTagsCliente();
  }

  removeTag(tag: Tag, scope: 'pedido' | 'cliente') {
    const same = (t: Tag) =>
      this.norm(t.nombre) === this.norm(tag.nombre) &&
      this.norm(t.direccion) === this.norm(tag.direccion);

    if (scope === 'pedido') {
      this.tagsPedido = this.tagsPedido.filter(t => !same(t));
    } else {
      this.tagsCliente = this.tagsCliente.filter(t => !same(t));
      this.saveTagsCliente();
    }
  }

  // ====== Inline edit filas ======
  startEdit(row: any) {
    row._backup = { ...row };
    row.editing = true;
  }

  saveEdit(row: any) {
    row.editing = false;
    delete row._backup;
    this.dataSource = new MatTableDataSource(this.ubicacion);
  }

  cancelEdit(row: any) {
    Object.assign(row, row._backup);
    row.editing = false;
    delete row._backup;
    this.dataSource = new MatTableDataSource(this.ubicacion);
  }

  // ====== Ciclo vida ======
  ngOnInit(): void {
    this.getEventos();
    this.getServicio();
    this.getEventoxServicio();
    this.visualizarService.selectAgregarPedido.fechaCreate = this.fechaCreate.toLocaleDateString();
    this.fechaValidate(this.fechaCreate);
    // si ya hay DNI cargado en el modelo, intenta cargar sus tags
    if (this.dniCliente) this.loadTagsCliente();
  }

  // ====== Fechas ======
  fechaValidate(date) {
    this.minimo = this.addDaysToDate(date, -10);
    this.maximo = this.addDaysToDate(date, 365);
  }

  convert(str) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }

  addDaysToDate(date, days) {
    var res = new Date(date);
    res.setDate(res.getDate() + days);
    return this.convert(res);
  }

  weekdayPeru(fechaISO: string): string {
    if (!fechaISO) return '';
    const [y, m, d] = fechaISO.split('-').map(Number);
    const dtUTC = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
    const fmt = new Intl.DateTimeFormat('es-PE', {
      weekday: 'short',
      timeZone: 'America/Lima',
    });
    return fmt.format(dtUTC); // ej. "vie"
  }
  rowInvalid(row: any): boolean {
    const fechaOk = !!row.Fecha;
    const horaOk = !!row.Hora;
    const dex = (row.DireccionExacta || '').trim();
    const direccionOk = !!(row.Direccion && row.Direccion.trim());
    const dexOk = dex.length >= 8; // mínimo visible
    return !(fechaOk && horaOk && direccionOk && dexOk);
  }

  // ====== Cliente ======
  getDataCliente(dni: number) {
    this.pedidoService.getDni(dni).subscribe((res) => {
      if (res.length == 0) {
        this.infoCliente;
      } else {
        this.infoCliente = res[0];
        // al tener DNI, carga tags del cliente
        this.loadTagsCliente();
      }
    },
      err => { console.log(err); });
  }

  buscarCliente(dni: number) {
    // ya estás bindendo dniCliente desde el input, lo usamos y cargamos tags
    this.getDataCliente(dni);
  }

  // ====== Catálogos ======
  getServicio() {
    this.pedidoService.getServicios().subscribe((responde) => {
      this.servicios = responde;
    });
  }

  asignarServicio(event: number) {
    this.servicioSeleccionado = event;
    this.getEventoxServicio();
  }

  getEventos() {
    this.pedidoService.getEventos().subscribe((responde) => {
      this.evento = responde;
    });
  }

  asignarEvento(event: number) {
    this.eventoSeleccionado = event;
    this.getEventoxServicio();
  }

  asignarDescripcion(id: number) {
    this.desID = id;
  }

  getEventoxServicio() {
    this.visualizarService
      .getEventosServicio(this.eventoSeleccionado, this.servicioSeleccionado).subscribe((res) => {
        this.eventoxsevicio = res;
        this.dataSource1 = new MatTableDataSource(res);
      });
  }

  radioSelected() {
    this.asignarDescripcion(this.selectedDescripcion);
  }

  // ====== Validación evento actual ======
  get canAgregarEvento(): boolean {
    const f = this.visualizarService.selectAgregarPedido.fechaEvent;
    const h = this.visualizarService.selectAgregarPedido.horaEvent;
    const u = (this.Direccion || '').trim();
    const dx = (this.DireccionExacta || '').trim();
    return !!(f && h && u && dx);
  }

  // ====== Agregar fila ======
  onQuickAdd() {
    if (!this.canAgregarEvento) return;
    this.addListUbicacion(
      this.Direccion,
      this.visualizarService.selectAgregarPedido.fechaEvent,
      this.visualizarService.selectAgregarPedido.horaEvent,
      this.DireccionExacta,
      this.NotasEvento
    );
    // limpiar campos de texto y dejar fecha/hora igual
    this.Direccion = '';
    this.DireccionExacta = '';
    this.NotasEvento = '';
  }

  addListUbicacion(direccion: string, fecha: string, hora: string, direccionExacta?: string, notas?: string) {
    // Duplicados por (Fecha + Hora + Ubicación)
    const yaExiste = this.ubicacion.some(u =>
      u.Fecha === fecha &&
      u.Hora === hora &&
      this.norm(u.Direccion) === this.norm(direccion || '')
    );
    if (yaExiste) {
      swal.fire({
        text: 'Ya existe un evento con la misma fecha, hora y ubicación.',
        icon: 'warning',
        showCancelButton: false,
        customClass: { confirmButton: 'btn btn-warning' },
        buttonsStyling: false
      });
      return;
    }

    const cualEliminar = { ID: 0, Direccion: '' };
    this.ubicacion = this.ubicacion.filter((item) => {
      return item.ID != cualEliminar.ID && item.Direccion != cualEliminar.Direccion;
    });

    // límite actual (8)
    if (this.ubicacion.length < 8) {
      const i = this.ubicacion.length ? Math.max(...this.ubicacion.map(u => u.ID)) + 1 : 1;
      this.ubicacion.push({
        ID: i,
        Direccion: direccion,
        Fecha: fecha,
        Hora: hora,
        DireccionExacta: direccionExacta ?? '',
        Notas: notas ?? ''
      });
      this.dataSource = new MatTableDataSource(this.ubicacion);
    } else {
      this.ubicacion;
    }
  }

  // ====== Eliminar fila ======
  async deleteElement(p: any, c: any) {
    const fila = this.ubicacion.find(x => x.Hora == c && x.Direccion == p);
    const { isConfirmed } = await swal.fire({
      title: '¿Eliminar ubicación?',
      html: `<div style="text-align:left">
            <b>Fecha:</b> ${fila?.Fecha || '-'}<br>
            <b>Hora:</b> ${fila?.Hora || '-'}<br>
            <b>Ubicación:</b> ${fila?.Direccion || '-'}
           </div>`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: { confirmButton: 'btn btn-danger', cancelButton: 'btn btn-secondary' },
      buttonsStyling: false
    });

    if (!isConfirmed) return;

    const idx = this.ubicacion.findIndex(x => x.Hora == c && x.Direccion == p);
    if (idx >= 0) {
      this.ubicacion.splice(idx, 1);
      this.dataSource = new MatTableDataSource(this.ubicacion);
    }
  }
  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.ubicacion, event.previousIndex, event.currentIndex);
    this.dataSource = new MatTableDataSource(this.ubicacion); // renumera # automáticamente
  }


  // ====== Enviar ======
  postPedido() {
    let data = {
      Nombre: this.visualizarService.selectAgregarPedido.NombrePedido,
      ExS: this.desID,
      doc: this.dniCliente?.toString(),
      fechaCreate: this.convert(this.fechaCreate),
      fechaEvent: this.visualizarService.selectAgregarPedido.fechaEvent,
      horaEvent: this.visualizarService.selectAgregarPedido.horaEvent,
      CodEmp: 1,
      Direccion: this.ubicacion[0]?.Direccion,
      Ubicacion: this.ubicacion[0]?.Direccion,
      Latitud: null,
      Longitud: null,
      fechaEvent2: "2021-12-09T23:08:53.820Z",
      horaEvent2: null,
      Direccion2: null,
      Ubicacion2: null,
      Latitud2: null,
      Longitud2: null,
      Observacion: this.visualizarService.selectAgregarPedido.Observacion
    }
    this.visualizarService.postPedidos(data).subscribe(
      (res) => {
        swal.fire({
          text: 'Registro exitoso',
          icon: 'success',
          showCancelButton: false,
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        });
      },
      (err) => {
        console.error(err)
        swal.fire({
          text: 'Ocurrió un error, volver a intentar.',
          icon: 'warning',
          showCancelButton: false,
          customClass: { confirmButton: 'btn btn-warning' },
          buttonsStyling: false
        });
      });
  }
}
