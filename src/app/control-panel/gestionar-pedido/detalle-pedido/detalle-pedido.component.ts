import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { PedidoService } from '../service/pedido.service';
import { VisualizarService } from '../service/visualizar.service';


@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.css']
})
export class DetallePedidoComponent implements OnInit {

  ID=this._route.snapshot.paramMap.get('id');

  constructor(public pedidoService: PedidoService,
    public visualizarService: VisualizarService,private _route:ActivatedRoute) { }

    
  ngOnInit(): void {
    this.getDetallePedidoView(Number(this.ID));
  }

  getDetallePedidoView(ID:number) {
    
    this.visualizarService.getPedidoById(ID).subscribe(
      response =>{
        this.visualizarService.selectProyecto=response[0];
        console.log( this.visualizarService.selectProyecto);
    });
  }
}
