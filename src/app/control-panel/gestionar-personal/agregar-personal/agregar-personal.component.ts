import { Component, OnInit } from '@angular/core';
import { PersonalService } from '../service/personal.service';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';

interface Cargo {
  idCargo: number;
  cargoNombre: string;
}

@Component({
  selector: 'app-agregar-personal',
  templateUrl: './agregar-personal.component.html',
  styleUrls: ['./agregar-personal.component.css']
})
export class AgregarPersonalComponent implements OnInit {

  public data: any;
  nombresPattern = "^[a-zA-Z ]{2,20}$";
  apellidoPattern = "^[a-zA-Z ]{2,30}$";
  docPattern = "^[0-9]{1}[0-9]{7}$";
  celularPattern = "^[1-9]{1}[0-9]{6,8}$";
  correoPattern = "^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$";

  constructor(public service: PersonalService) { }
  cargos: Cargo[] = [];
  ngOnInit(): void {
    this.getCargos();
  }
  AddEmpleado(EmpleadoForm: NgForm) {
    let data = {
      empleado: this.data,

      nombre: EmpleadoForm.value.nombre,
      apellido: EmpleadoForm.value.apellido,
      correo: EmpleadoForm.value.correo,
      celular: EmpleadoForm.value.celular,
      doc: EmpleadoForm.value.doc,
      direccion: EmpleadoForm.value.direccion,
      autonomo: EmpleadoForm.value.autonomo,
      cargo: EmpleadoForm.value.cargo
    };
    this.service.createEmpleado(data).subscribe(
      (res) => {
        this.clear(EmpleadoForm);
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
      }
    );
  }

  clear(EmpleadoForm: NgForm) {
    EmpleadoForm.reset();
  }
  getCargos() {
    this.service.getCargos().subscribe(
      response => {
        console.log(response);

        this.cargos = response;
      });
  }

}
