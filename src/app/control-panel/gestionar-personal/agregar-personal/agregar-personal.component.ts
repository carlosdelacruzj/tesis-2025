import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import swal from 'sweetalert2';
import { PersonalService, Cargo } from '../service/personal.service';

// DTO local para crear empleado
type EmpleadoCreateDto = {
  nombre: string;
  apellido: string;
  correo: string;
  celular: string;
  documento: string;
  direccion: string;
  autonomo: 'SI' | 'NO';
  idCargo: number;
  idEstado?: number; // opcional (por ejemplo 1 = DISPONIBLE)
};

@Component({
  selector: 'app-agregar-personal',
  templateUrl: './agregar-personal.component.html',
  styleUrls: ['./agregar-personal.component.css']
})
export class AgregarPersonalComponent implements OnInit {
  // Patrones (deja los tuyos si prefieres)
  nombresPattern = '^[a-zA-Z ]{2,20}$';
  apellidoPattern = '^[a-zA-Z ]{2,30}$';
  docPattern = '^[0-9]{1}[0-9]{7}$';
  celularPattern = '^[1-9]{1}[0-9]{6,8}$';
  correoPattern = '^[a-z]+[a-z0-9._]+@[a-z]+\\.[a-z.]{2,5}$';

  cargos = [];

  // ←↓↓ ESTA ES LA PROPIEDAD QUE REFIERE TU HTML ↓↓→
  nuevo: EmpleadoCreateDto = {
    nombre: '',
    apellido: '',
    correo: '',
    celular: '',
    documento: '',
    direccion: '',
    autonomo: 'NO',
    idCargo: 0,
    idEstado: 1, // por defecto
  };

  constructor(public service: PersonalService) { }

  ngOnInit(): void {
    this.getCargos();
  }

  getCargos(): void {
    this.service.getCargos().subscribe({
      next: (res) => (this.cargos = res),
      error: (e) => console.error(e),
    });
  }

  AddEmpleado(form: NgForm): void {
    if (form.invalid) {
      form.control.markAllAsTouched();
      return;
    }

    // Normaliza tipos numéricos por si vienen como string desde el select
    const payload: EmpleadoCreateDto = {
      ...this.nuevo,
      idCargo: Number(this.nuevo.idCargo),
      idEstado: this.nuevo.idEstado !== undefined ? Number(this.nuevo.idEstado) : undefined,
      autonomo: this.nuevo.autonomo === 'SI' ? 'SI' : 'NO',
    };

    this.service.createEmpleado(payload).subscribe({
      next: () => {
        this.clear(form);
        swal.fire({
          text: 'Registro exitoso',
          icon: 'success',
          showCancelButton: false,
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false,
        });
      },
      error: (err) => {
        console.error(err);
        swal.fire({
          text: 'Ocurrió un error, volver a intentar.',
          icon: 'warning',
          showCancelButton: false,
          customClass: { confirmButton: 'btn btn-warning' },
          buttonsStyling: false,
        });
      },
    });
  }

  clear(form: NgForm): void {
    form.resetForm({
      nombre: '',
      apellido: '',
      correo: '',
      celular: '',
      documento: '',
      direccion: '',
      autonomo: 'NO',
      idCargo: 0,
      idEstado: 1,
    });
  }
}
