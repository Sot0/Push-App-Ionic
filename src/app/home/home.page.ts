import { Component, OnInit, ApplicationRef } from '@angular/core';
import { PushNotificationsService } from '../services/push-notifications.service';
import { OSNotificationPayload } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  mensajes: OSNotificationPayload[] = [];

  constructor(
    public pushServices: PushNotificationsService,
    private applicationRef: ApplicationRef
  ) {}

  ngOnInit() {
    this.pushServices.pushListener.subscribe( notificacion => {
      this.mensajes.unshift( notificacion );
      // Hacer el ciclo de detección de cambios nuevamente
      this.applicationRef.tick();
    });
  }

  async ionViewWillEnter() {
    // cargar los mensajes del servicio
    this.mensajes = await this.pushServices.getMensajes();
  }
  async borrarMensajes() {
    await this.pushServices.borrarMensajes();
    this.mensajes = [];
  }

}
