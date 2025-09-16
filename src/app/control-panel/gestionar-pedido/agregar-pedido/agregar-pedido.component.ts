import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PedidoService } from '../service/pedido.service';
import { VisualizarService } from '../service/visualizar.service';
import swal from 'sweetalert2';
import { Time } from '@angular/common';

@Component({
  selector: 'app-agregar-pedido',
  templateUrl: './agregar-pedido.component.html',
  styleUrls: ['./agregar-pedido.component.css']
})
export class AgregarPedidoComponent implements OnInit {

  columnsToDisplay = ['Fecha', 'Hora', 'Direccion', 'Quitar'];
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
  fechaCreate: Date = new Date();
  minimo: string;
  maximo: string;
  ubicacion = [{ ID: 0, Direccion: '', Fecha: '', Hora: '' }];
  lat: any;
  lng: any;
  selectedDescripcion;

  constructor(public pedidoService: PedidoService, public visualizarService: VisualizarService,) { }

  ngOnInit(): void {
    this.getEventos();
    this.getServicio();
    this.getEventoxServicio();
    this.visualizarService.selectAgregarPedido.fechaCreate = this.fechaCreate.toLocaleDateString();
    this.fechaValidate(this.fechaCreate);
  }
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

  getDataCliente(dni: number) {
    this.pedidoService.getDni(dni).subscribe((res) => {


      if (res.length == 0) {
        this.infoCliente;
      } else {
        this.infoCliente = res[0];
        console.log(this.infoCliente);

      }
    },
      err => { console.log(err); });
  }

  buscarCliente(dni: number) {
    this.getDataCliente(dni);
  }

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

  addListUbicacion(direccion: string, fecha: string, hora: string) {
    var cualEliminar = { ID: 0, Direccion: '' }
    console.log(direccion, fecha, hora)
    this.ubicacion = this.ubicacion.filter((item) => {
      return item.ID != cualEliminar.ID && item.Direccion != cualEliminar.Direccion
    });
    if (this.ubicacion.length < 2) {
      let i = 1;;
      this.ubicacion.push({ ID: i, Direccion: direccion, Fecha: fecha, Hora: hora });
      i++;
      this.dataSource = new MatTableDataSource(this.ubicacion);

    } else {
      this.ubicacion;
    }
  }

  deleteElement(p: any, c: any) {
    console.log(p, c);
    let indexToDelete;
    this.ubicacion.filter((item, index) => {
      if (item.Hora == c && item.Direccion == p) {
        indexToDelete = index;
        console.log(indexToDelete);

      }
    });
    this.ubicacion.splice((Number)(indexToDelete), 1);
    this.dataSource = new MatTableDataSource(this.ubicacion);
    console.log(this.ubicacion);
  }

  postPedido() {
    console.log(this.visualizarService.selectAgregarPedido.fechaEvent);
    console.log(this.convert(this.fechaCreate));
    let data = {
      Nombre: this.visualizarService.selectAgregarPedido.NombrePedido,
      ExS: this.desID,
      doc: this.dniCliente.toString(),
      fechaCreate: this.convert(this.fechaCreate),
      fechaEvent: this.visualizarService.selectAgregarPedido.fechaEvent,
      horaEvent: this.visualizarService.selectAgregarPedido.horaEvent,
      CodEmp: 1,
      Direccion: this.ubicacion[0].Direccion,
      Ubicacion: this.ubicacion[0].Direccion,
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
          customClass: {
            confirmButton: 'btn btn-success',
          },
          buttonsStyling: false
        });
      },
      (err) => {
        console.error(err)
        swal.fire({
          text: 'Ocurrió un error, volver a intentar.',
          icon: 'warning',
          showCancelButton: false,
          customClass: {
            confirmButton: 'btn btn-warning',
          },
          buttonsStyling: false
        });
      });
  }
}
