import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { PersonalService } from './service/personal.service';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UntypedFormControl, UntypedFormGroup, NgForm, Validators } from '@angular/forms';
import swal from 'sweetalert2';

interface Cargo {
  ID: string;
  Nombre: string;
}

@Component({
  selector: 'app-gestionar-personal',
  templateUrl: './gestionar-personal.component.html',
  providers: [NgbModalConfig, NgbModal],
  styleUrls: ['./gestionar-personal.component.css']

})
export class GestionarPersonalComponent implements OnInit {

  columnsToDisplay = [
    'ID',
    'Nombres y apellidos',
    'Cargo',
    'DNI',
    'Estado',
    'Acciones'
  ];

  cargos: Cargo[] = [];
  dataSource!: MatTableDataSource<any>;
  form = new UntypedFormGroup({
    cargoF: new UntypedFormControl(null, Validators.required)
  });

  public data: any;
  nombresPattern = "^[a-zA-Z ]{2,20}$";
  apellidoPattern = "^[a-zA-Z ]{2,30}$";
  docPattern = "^[0-9]{1}[0-9]{7}$";
  celularPattern = "^[1-9]{1}[0-9]{6,8}$";
  correoPattern = "^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$";

  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;

  constructor(
    public service: PersonalService,
    config: NgbModalConfig, private modalService: NgbModal
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.getEmpleados();
  }

  getEmpleados() {
    this.service.getEmpleados().subscribe((response: any) => {
      console.log(response);

      this.dataSource = new MatTableDataSource(response);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.matSort;
    });
  }
  getCargos() {
    this.service.getCargos().subscribe(
      response => {
        this.cargos = response;
      });
  }

  filterData($event: any) {
    this.dataSource.filter = $event.target.value;
  }

  open(content: any, ID: Number) {
    this.modalService.open(content);
    this.getEmpleadoView(ID);
    this.getCargos();
  }
  getEmpleadoView(ID: Number) {
    this.service.getEmpleadoID(ID).subscribe(response => {
      const r = Array.isArray(response) ? response[0] : response;
      this.service.selectListar = r;  // ← asigna el objeto directamente
      console.log(this.service.selectListar);
    });
  }
  UpdateEmpleado(EmpleadoForm: NgForm) {
    console.log(EmpleadoForm.value.Estado);
    console.log(EmpleadoForm.value);
    this.service.updateEmpleado(EmpleadoForm.value).subscribe(
      (res) => {
        this.getEmpleados();
        this.getEmpleadoView(EmpleadoForm.value.ID);

        swal.fire({
          text: 'Se actulizó al empleado exitosamente',
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
      }
    );
  }
}
