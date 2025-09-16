import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { NgbModalConfig, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { NgForm, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import swal from 'sweetalert2';

import { PersonalService } from './service/personal.service';
import { Empleado, EmpleadoUpdateDto } from './model/personal.model';

type Cargo = { idCargo: number; cargo: string };

@Component({
  selector: 'app-gestionar-personal',
  templateUrl: './gestionar-personal.component.html',
  providers: [NgbModalConfig, NgbModal],
  styleUrls: ['./gestionar-personal.component.css']
})
export class GestionarPersonalComponent implements OnInit {

  // OJO: estos IDs de columna tienen espacios porque tu template actual los usa así.
  // Cuando actualices el HTML, cámbialos a ids sin espacios (p.ej. 'codigo', 'fullName'...).
  columnsToDisplay = ['ID', 'Nombres y apellidos', 'Cargo', 'DNI', 'Estado', 'Acciones'];

  dataSource = new MatTableDataSource<Empleado>([]);
  cargos: Cargo[] = [];
  selected: Empleado | null = null;

  form = new UntypedFormGroup({
    cargoF: new UntypedFormControl(null, Validators.required)
  });

  celularPattern = '^[1-9]{1}[0-9]{6,8}$';
  correoPattern = '^[\\w.+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$';

  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) matSort!: MatSort;

  constructor(
    public service: PersonalService,
    config: NgbModalConfig,
    private modalService: NgbModal
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
  }

  ngOnInit(): void {
    this.getEmpleados();
  }

  getEmpleados(): void {
    this.service.getEmpleados().subscribe((list) => {
      this.dataSource = new MatTableDataSource(list);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.matSort;

      // Filtro simple por varias columnas
      this.dataSource.filterPredicate = (data, filter) => {
        const f = (filter || '').trim().toLowerCase();
        return (
          data.codigoEmpleado.toLowerCase().includes(f) ||
          `${data.nombre} ${data.apellido}`.toLowerCase().includes(f) ||
          data.documento.toLowerCase().includes(f) ||
          data.cargo.toLowerCase().includes(f) ||
          (data.autonomo === 'SI' ? 'autonomo' : 'dependiente').includes(f)
        );
      };
    });
  }

  getCargos(): void {
    this.service.getCargos().subscribe((res) => (this.cargos = res));
  }

  filterData($event: any): void {
    const value = ($event?.target?.value ?? '').toString().toLowerCase();
    this.dataSource.filter = value;
    if (this.dataSource.paginator) this.dataSource.paginator.firstPage();
  }

  open(content: any, id: number): void {
    this.modalService.open(content);
    this.getEmpleadoView(id);
    this.getCargos();
  }

  getEmpleadoView(id: number): void {
    this.service.getEmpleadoById(id).subscribe((emp) => {
      this.selected = emp;               // ← guarda el objeto seleccionado
      console.log('Empleado seleccionado', this.selected);
    });
  }

  UpdateEmpleado(EmpleadoForm: NgForm): void {
    if (!this.selected) return;

    // Tu template actual usa nombres tipo "Correo", "Celular", "Direccion", "Estado" e "ID".
    // Mapeamos esos nombres a nuestro DTO.
    const v = EmpleadoForm.value || {};
    const dto: EmpleadoUpdateDto = {
      idEmpleado: Number(v.ID ?? this.selected.idEmpleado),
      correo: v.Correo ?? this.selected.correo,
      celular: v.Celular ?? this.selected.celular,
      direccion: v.Direccion ?? this.selected.direccion,
      // Si ya tienes idEstado en el form (select), conviértelo a número; de lo contrario, omítelo.
      idEstado: v.Estado !== undefined && v.Estado !== null ? Number(v.Estado) : undefined
    };

    this.service.updateEmpleado(dto).subscribe({
      next: () => {
        this.getEmpleados();
        this.getEmpleadoView(dto.idEmpleado);
        swal.fire({
          text: 'Se actualizó al empleado exitosamente',
          icon: 'success',
          showCancelButton: false,
          customClass: { confirmButton: 'btn btn-success' },
          buttonsStyling: false
        });
      },
      error: (err) => {
        console.error(err);
        swal.fire({
          text: 'Ocurrió un error, volver a intentar.',
          icon: 'warning',
          showCancelButton: false,
          customClass: { confirmButton: 'btn btn-warning' },
          buttonsStyling: false
        });
      }
    });
  }
}
