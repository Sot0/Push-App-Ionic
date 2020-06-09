import { Injectable, EventEmitter } from '@angular/core';

import { OneSignal, OSNotification, OSNotificationPayload } from '@ionic-native/onesignal/ngx';

import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationsService {

  mensajes: OSNotificationPayload[] = [];

  userId: string;

  pushListener = new EventEmitter<OSNotificationPayload>();

  constructor(
    private oneSignal: OneSignal,
    private storage: Storage
  ) {
    this.cargarMensajes();
  }

  async getMensajes() {
    await this.cargarMensajes();
    return [...this.mensajes];
  }

  configuracionInicial() {
    // ID OneSignal Project, ID remitente firebase project
    this.oneSignal.startInit('d0cf0a42-0c18-4b51-bf86-caedeaad3358', '747994327200');

    this.oneSignal.inFocusDisplaying( this.oneSignal.OSInFocusDisplayOption.Notification );

    this.oneSignal.handleNotificationReceived().subscribe(noti => {
      // do something when notification is received
      console.log('Notificación recibida', noti);
      this.notificacionRecibida(noti);
    });

    this.oneSignal.handleNotificationOpened().subscribe(async noti => {
      // do something when a notification is opened
      await this.notificacionRecibida(noti.notification);
      console.log('Notificación abierta', noti);
    });

    // Obtener ID del suscriptor
    this.oneSignal.getIds()
      .then(info => {
        this.userId = info.userId;
        console.log(info.userId);
      });

    this.oneSignal.endInit();
  }

  async notificacionRecibida( notificacion: OSNotification ) {

    await this.cargarMensajes();

    const { payload } = notificacion;

    const existePush = this.mensajes.find( mensaje => mensaje.notificationID === payload.notificationID);

    if (existePush) return;

    this.mensajes.unshift( payload );

    this.pushListener.emit( payload );

    await this.guardarMensajes();
  }
  
  guardarMensajes() {
    this.storage.set('pushAppNotif', this.mensajes);
  }

  async cargarMensajes() {
    this.mensajes = await this.storage.get('pushAppNotif') || [];
    return this.mensajes;
  }

  async borrarMensajes() {
    await this.storage.remove('pushAppNotif');
    this.mensajes = [];
    this.guardarMensajes();
  }

}
