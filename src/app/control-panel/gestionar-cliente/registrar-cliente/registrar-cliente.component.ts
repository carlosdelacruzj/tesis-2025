import { Component, Input, OnInit } from '@angular/core';
import { ClienteService } from '../service/cliente.service';
import { FormGroup, NgForm, NgModel } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Cliente } from '../model/cliente.model';
import { DateAdapter } from '@angular/material/core';
import swal from 'sweetalert2';

@Component({
  selector: 'app-registrar-cliente',
  templateUrl: './registrar-cliente.component.html',
  styleUrls: ['./registrar-cliente.component.css']
})
export class RegistrarClienteComponent implements OnInit {

  nombrePattern = "^[a-zA-Z ]{2,20}$";
  apellidoPattern = "^[a-zA-Z ]{2,30}$";
  docPattern = "^[0-9]{1}[0-9]{7}$";
  celularPattern = "^[1-9]{1}[0-9]{6,8}$";
  correoPattern = "^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$";

  constructor(public service: ClienteService) { }

  ngOnInit(): void {
  }

  addCliente(ClienteForm: NgForm) {
    let data = {
      nombre: ClienteForm.value.nombre,
      apellido: ClienteForm.value.apellido,
      correo: ClienteForm.value.correo,
      numDoc: ClienteForm.value.doc,
      celular: ClienteForm.value.celular,
      direccion: ClienteForm.value.direccion,
    };
    console.log(data);
    this.service.addCliente(data).subscribe(
      (res) => {
        this.clear(ClienteForm);
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
        const msg = err?.error?.message || 'Ocurrió un error, volver a intentar.';
        swal.fire({
          text: msg, icon: 'warning', showCancelButton: false,
          customClass: { confirmButton: 'btn btn-warning' }, buttonsStyling: false
        });
      }

    );
  }
  clear(ClienteForm: NgForm) {
    ClienteForm.reset();
  }
}
