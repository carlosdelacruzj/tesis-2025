import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AgregarPedido, EditarPedido, Proyecto, EventServi2 } from '../model/visualizar.model';
import { Pedido } from '../../gestionar-proyecto/model/pedido.model';
import { environment } from 'src/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class VisualizarService {
  selectProyecto: Proyecto = {
    Empleado: '',
    N_Pedido: 0,
    Cliente: '',
    F_Registro: '',
    EstadoPedido: '',
    Costo_Total: 0,
    Acuenta: 0,
    EstadoPago: '',
    Evento: '',
    Servicio: '',
    F_Evento: '',
    Hora_Evento: '',
    Direccion: '',
    Descripcion: '',
    NombrePedido: '',
    Ubicacion: '',
    Latitud: null,
    Longitud: null,
    F_Evento2: '',
    Hora_Evento2: '',
    Direccion2: '',
    Ubicacion2: '',
    Latitud2: null,
    Longitud2: null

  };

  selectEditarPedido: EditarPedido = {
    EP_Cod: 0,
    fecha: '',
    hora: '',
    ubicacion: '',
    lugar: '',
    latitud: '',
    longitud: '',
    fecha2: '',
    hora2: '',
    ubicacion2: '',
    lugar2: '',
    latitud2: '',
    longitud2: '',
    id: 0
  };

  selectAgregarPedido: AgregarPedido = {
    NombrePedido: '',
    ExS: 0,
    doc: '',
    fechaCreate: '',
    fechaEvent: '',
    horaEvent: '',
    CodEmp: 0,
    Direccion: '',
    Observacion: '',

  };

  private GET_EVENTO_BY_SERVICIOS = `${environment.baseUrl}/eventos_servicios`;
  private API_VISUALIZAR =
    'https://tp2021database.herokuapp.com/pedido/consulta/getByIDPedido/';

  private API_EDITARPEDIDO =
    'https://tp2021database.herokuapp.com/pedido/actualiza/putByIdPedido';

  private API_AGREGARPEDIDO =
    'https://tp2021database.herokuapp.com/pedido/registro/postPedido';

  // private GET_EVENTO_BY_SERVICIOS =
  // 'https://tp2021database.herokuapp.com/eventos_servicios/consulta/getAllServiciosByEventoServ/';

  constructor(private http: HttpClient) { }


  public getPedidoID(id: any): Observable<any> {
    return this.http.get(this.API_VISUALIZAR + id);
  }
  public getEventosServicio(evento?: number, servicio?: number) {
    let params = new HttpParams();
    if (evento != null) params = params.set('evento', String(evento));
    if (servicio != null) params = params.set('servicio', String(servicio));

    return this.http.get<any[]>(this.GET_EVENTO_BY_SERVICIOS, { params });
  }
  public putPedido(data: any): Observable<any> {
    console.log(data)
    return this.http.put(this.API_EDITARPEDIDO, data)
  }
  public postPedidos(data: any) {
    return this.http.post(this.API_AGREGARPEDIDO, data)
  }

}