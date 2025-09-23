import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { PedidoService } from './service/pedido.service';
import { VisualizarService } from './service/visualizar.service';

@Component({
  selector: 'app-gestionar-pedido',
  templateUrl: './gestionar-pedido.component.html',
  styleUrls: ['./gestionar-pedido.component.css'],
})
export class GestionarPedidoComponent implements OnInit {

  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  @ViewChild(MatSort) matSort!: MatSort;
  @ViewChild('paginator') paginator!: MatPaginator;

  // ⇩ Columnas nuevas para lo que devuelve el SP
  columnsToDisplay = [
    'ID',
    'Cliente',
    'Creado',
    'ProxFecha',
    'ProxHora',
    'Ubicacion',
    'TipoEvento',
    'Total',
    'Estado',
    'Pago',
    'Visualizar',
  ];

  // (opcional) modal / estado previo que ya tenías
  closeResult = '';
  idPedido = 0;

  constructor(
    private service: PedidoService,
    private service2: VisualizarService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.getPedidos();
  }

  getPedidos() {
    // Asegúrate que PedidoService apunte a GET /pedido (SP_getAllPedido)
    this.service.getAllPedidos().subscribe({
      next: (rows) => {
        console.log('SP_getAllPedido -> primera fila:', rows?.[0]);
        this.dataSource = new MatTableDataSource(rows || []);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.matSort;

        // Filtro global por columnas visibles
        this.dataSource.filterPredicate = (row: any, filter: string) => {
          const f = (filter || '').trim().toLowerCase();
          return [
            row?.ID,
            row?.Cliente,
            row?.Documento,
            row?.Ubicacion,
            row?.TipoEvento,
            row?.Estado,
            row?.Pago,
            row?.TotalLabel,
            row?.ProxFecha,
            row?.ProxHora
          ].join(' ').toLowerCase().includes(f);
        };
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.dataSource = new MatTableDataSource([]);
      }
    });
  }

  filterData($event: any) {
    this.dataSource.filter = ($event?.target?.value || '').trim().toLowerCase();
  }

  // ========= Modal opcional que ya tenías =========
  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }
  private getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) return 'by pressing ESC';
    if (reason === ModalDismissReasons.BACKDROP_CLICK) return 'by clicking on a backdrop';
    return `with: ${reason}`;
  }
}
