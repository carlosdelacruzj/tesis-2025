import { formatDate } from '@angular/common';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { NgForm } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbModal, NgbModalConfig } from '@ng-bootstrap/ng-bootstrap';
import { EquipoAll, EquipoAllGroup } from './models/modeloprueba.model';
import { AdministrarEquiposService } from './service/service.service';
import swal from 'sweetalert2';

interface TEquipo {
  PK_TE_Cod: number;
  TE_Nombre: string;
}

interface MEquipo {
  Id: number;
  Nombre: string;
}

interface Proyecto {
  ID: number;
  Nombre: string;
  Fecha: string;
  Servicio: string;
  Evento: string;
  Estado: number;
}

interface Empleado {
  ID: number;
  Nombre: string;
  Apellido: string;
  Car_Nombre: string;
  DNI: string;
  Celular: string;
  Correo: string;
  Autonomo: number;
  Cargo: string;
  Estado: string;
}

@Component({
  selector: 'app-administrar-equipos',
  templateUrl: './administrar-equipos.component.html',
  styleUrls: ['./administrar-equipos.component.css'],
})
export class AdministrarEquiposComponent implements OnInit {
  //Equipos Adquiridos
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild(MatSort) matSortA!: MatSort;
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild('paginatorA') paginatorA!: MatPaginator;
  dataSource!: MatTableDataSource<any>;
  dataSourceA!: MatTableDataSource<any>;

  //VALIDACION DE FECHA
  minimo: string = '';
  maximo: string = '';
  fechaFinEdicion: Date = new Date();

  @Input() estado = 'ALQUILADO';

  proyecto: Proyecto[] = [];
  empleado: Empleado[] = [];
  equipos: TEquipo[] = [];
  marcas: MEquipo[] = [];
  esPrincipal: boolean = true;
  isPrincipal: boolean = true;
  idEquipo: number = 0;
  idMarca: number = 0;
  idModelo: number = 0;
  Modelo: string = '';
  id: number = 0;
  serie: string = '';
  seriePattern = '^[A-Z]{3,3}[-]{1,1}[0-9]{3,3}$';

  hoy: number = Date.now();

  sHoy = '';
  existe: number = 0;

  idProyecto: number = 0;

  columnsToDisplay = ['equipo', 'marca', 'modelo', 'cEquipo', 'ver'];

  columnsToDisplayA = [
    'equipo',
    'serie',
    'proyectoAsig',
    'empleadoAsig',
    'estado',
    'detalle',
  ];

  constructor(
    public service: AdministrarEquiposService,
    config: NgbModalConfig,
    private modalService: NgbModal
  ) {
    config.backdrop = 'static';
    config.keyboard = false;

    this.sHoy = formatDate(this.hoy, 'yyyy-MM-dd', 'en-US');
  }

  ngOnInit(): void {
    this.getEquipos();
    this.getEquiposAlquilados();
    this.getTipoEquipos();
    this.getMarcaEquipos();
    //VALIDACION DE FECHA
    this.fechaValidate(this.fechaFinEdicion);
  }
  //VALIDACION DE FECHA
  fechaValidate(date:any) {

    this.minimo = this.addDaysToDate(date, 1);
    this.maximo = this.addDaysToDate(date, 365);
  }

  addDaysToDate(date:any, days:any) {
    var res = new Date(date);
    res.setDate(res.getDate() + days);
    return this.convert(res);
  }
  convert(str:any) {
    var date = new Date(str),
      mnth = ("0" + (date.getMonth() + 1)).slice(-2),
      day = ("0" + date.getDate()).slice(-2);
    return [date.getFullYear(), mnth, day].join("-");
  }
  //FIN VALIDACION DE FECHA
  //Muestra de tabla equipos adquiridos
  getEquipos() {
    this.service.getAllGroup().subscribe((response: any) => {
      console.log(response);
      
      this.dataSource = new MatTableDataSource(response);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.matSort;
    });
  }
  getEmpleados() {
    this.service.getAllEmpleados().subscribe((response) => {
      this.empleado = response;
    });
  }
  getProyectos() {
    this.service.getAllProyectos().subscribe((response) => {
      this.proyecto = response;
    });
  }

  //Muestra la tabla de equipos alquilados
  getEquiposAlquilados() {
    this.service.getEquiposAlquilados().subscribe((response: any) => {
      this.dataSourceA = new MatTableDataSource(response);
      this.dataSourceA.paginator = this.paginatorA;
      this.dataSourceA.sort = this.matSortA;
    });
  }
  //
  getTipoEquipos() {
    this.service.getTipoEquipo().subscribe((response) => {
      this.equipos = response;
    });
  }
  getMarcaEquipos() {
    this.service.getMarcaEquipo().subscribe((response) => {
      this.marcas = response;
    });
  }
  //BUSCADOR GENERAL
  filterData($event: any) {
    this.dataSource.filter = $event.target.value;
  }
  filterData2($event: any) {
    this.dataSourceA.filter = $event.target.value;
  }
  //Segunda vista
  verDetalle(
    idEquipo: number,
    idMarca: number,
    idModelo: number,
    Modelo: string
  ) {
    this.esPrincipal = false;
    this.idEquipo = idEquipo;
    this.idMarca = idMarca;
    this.idModelo = idModelo;
    this.Modelo = Modelo;
  }
  //vISTA ALQUILDO
  verDetalleAlquilado(id: number, serie: string) {
    this.isPrincipal = false;
    this.id = id;
    this.serie = serie;
  }

  registrarAlquilado(content: any) {
    this.modalService.open(content);
    this.getProyectos();
    this.getEmpleados();
    this.service.postAlquilado.estado = this.estado;
    this.service.postAlquilado.fechaEntrada = this.sHoy;
  }
  //Selector de seria devuelve. Existe = 1 | No existe = 0
  getSerie1(idEquipo: string) {
    this.service.getExisteSerie(idEquipo).subscribe((response) => {
      this.existe = response;
      console.log(this.existe)
    });
  }
  clear(equipoForm: NgForm) {
    equipoForm.reset();
  }
  //Registro de equipo Alquilado
  addAlquilado(equipoForm: NgForm) {
    this.getSerie1(equipoForm.value.serie)
    console.log(this.existe)
    //inicio
    if (this.existe === 1) {
      swal.fire({
        text: 'La serie ingresada ya existe',
        icon: 'warning',
        showCancelButton: false,
        customClass: {
          confirmButton: 'btn btn-warning',
        },
        buttonsStyling: false,
      });
    } else if (this.existe === 0) {//FINNNN
      swal
        .fire({
          title: 'Esta seguro del registro?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, registrar ahora!',
          cancelButtonText: 'Cancelar',
        })
        .then((options) => {
          if (options.isConfirmed) {
            swal.fire({
              text: 'Registro exitoso',
              icon: 'success',
              showCancelButton: false,
              customClass: {
                confirmButton: 'btn btn-success',
              },
              buttonsStyling: false,
            });
            let data = {
              tipoEquipo: equipoForm.value.tipoEquipo,
              marca: equipoForm.value.marca,
              modelo: equipoForm.value.modelo,
              serie: equipoForm.value.serie,
              fechaEntrada: equipoForm.value.fechaEntrada,
              fechaSalida: equipoForm.value.fechaSalida,
              fk_Pro_Cod: equipoForm.value.fk_Pro_Cod,
              fk_Empleado_Cod: equipoForm.value.fk_Empleado_Cod,
              estado: equipoForm.value.estado,
            };
            this.service.rEquipoA(data).subscribe(
              (res) => {
                console.log('DATA: ', res);
                this.clear(equipoForm);
                this.getEquipos();
                this.getEquiposAlquilados();
                this.getTipoEquipos();
                this.getMarcaEquipos();
              },
              (err) => {
                console.error(err);
                swal.fire({
                  text: 'Ocurrió un error, volver a intentar.',
                  icon: 'warning',
                  showCancelButton: false,
                  customClass: {
                    confirmButton: 'btn btn-warning',
                  },
                  buttonsStyling: false,
                });
              }
            );
          }
        });
        //INICIO
      }
      //FINNNNNNNNNN
  }
}
