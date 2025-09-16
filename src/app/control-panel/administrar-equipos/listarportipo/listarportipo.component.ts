import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AdministrarEquiposService } from '../service/service.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-listarportipo',
  templateUrl: './listarportipo.component.html',
  styleUrls: ['./listarportipo.component.css']
})
export class ListarportipoComponent implements OnInit {
  @ViewChild(MatSort) matSort1!: MatSort;
  @ViewChild(MatSort) matSort2!: MatSort;
  @ViewChild('paginator') paginator1!: MatPaginator;
  @Input() idEquipo = 0;
  @Input() idMarca = 0;
  @Input() idModelo = 0;
  @Input() Modelo = '';

  toggle = true;
  Estado: string = '';
  txtEstado: string = this.Estado;

  existe: number = 0;

  seriePattern = "^[A-Z]{3,3}[-]{1,1}[0-9]{3,3}$"

  hoy: number = Date.now();
  sHoy = '';

  dataSource1!: MatTableDataSource<any>;
  dataSource2!: MatTableDataSource<any>;

  columnsToDisplay = [
    'equipo',
    'marca',
    'modelo',
    'serie',
    'fecha',
    'estado',
    'estados',
  ];
  columnsToDisplay2 = ['disponible', 'enUso', 'mantenimiento', 'noDisponible'];

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
    this.getEquipoMarcaModeloAll();
    this.getCEstados();
  }
  //Muestra la tabla por agupacion de datos de TIPO DE EQUIPO | MARCA | MODELO
  getEquipoMarcaModeloAll() {
    this.service
      .getEquipoMarcaModelo(this.idEquipo, this.idMarca, this.idModelo)
      .subscribe((response: any) => {
       console.log(response);
        
        this.dataSource1 = new MatTableDataSource(response);
        this.dataSource1.paginator = this.paginator1;
        this.dataSource1.sort = this.matSort1;
      });
  }
  // BUSCADOR GENERAL
  filterData($event: any) {
    this.dataSource1.filter = $event.target.value;
  }
  // Modal para el registro del equipo.
  open(content: any) {
    this.modalService.open(content);
    this.service.registerEquipo.modelo = this.idModelo;
    this.service.registerEquipo.fecha = this.sHoy;
  }
  //Contador de estados de los equipos por MODELO
  getCEstados() {
    this.service.getCountEstados(this.idModelo).subscribe((response: any) => {
      this.dataSource2 = new MatTableDataSource(response);
      this.dataSource2.sort = this.matSort2;
    });
  }
  //Selector de seria devuelve. Existe = 1 | No existe = 0
  getSerie2(idEquipo: string) {
    this.service.getExisteSerie(idEquipo).subscribe((response: any) => {
      this.existe = response;
    });
  }
  //Registro de equipo
  addEquipo(equipoForm: NgForm) {
    this.getSerie2(equipoForm.value.idEquipo)
    console.log(this.existe, equipoForm.value.idEquipo)
    if (this.existe === 1) {
      swal.fire({
        text: 'La serie ingresada ya existe',
        icon: 'warning',
        showCancelButton: false,
        customClass: {
          confirmButton: 'btn btn-warning',
        },
        buttonsStyling: false
      })
    } else if (this.existe === 0) {
      swal
        .fire({
          title: 'Esta seguro del registro?',
          text: 'El equipo se registrara con el modelo ' + this.Modelo,
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#3085d6',
          cancelButtonColor: '#d33',
          confirmButtonText: 'Si, registrar ahora!',
          cancelButtonText: 'Cancelar'
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
              buttonsStyling: false
            })
            let data = {
              idEquipo: equipoForm.value.idEquipo,
              fecha: equipoForm.value.fecha,
              modelo: equipoForm.value.modelo
            };
            this.service.rEquipo(data).subscribe(
              (res) => {
                console.log('DATA: ', res);
                this.clear(equipoForm);
                this.getEquipoMarcaModeloAll();
                this.getCEstados();
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
              }
            );
          }
        })
    }
  }
  clear(equipoForm: NgForm) {
    equipoForm.reset();
  }
  //Cambiar el estado de un equipo mediante su numero de serie.
  putStatus(idEquipo: string) {
    this.service.updateStatus(idEquipo).subscribe((response: any) => {
      this.getEquipoMarcaModeloAll();
      this.getCEstados();
    });
  }
  //Control de botones de estado. Habilitados unicamente para En Uso y No disponible
  isDisable(Estado: string) {
    if (Estado === 'En Uso' || Estado === 'No Disponible') {
      return true;
    }
    return false;
  }

}
