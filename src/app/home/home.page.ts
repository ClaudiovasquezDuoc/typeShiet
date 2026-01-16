import { Component } from '@angular/core';
import { IonHeader, IonTitle, IonContent, IonFooter, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonImg, IonCardContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonHeader, IonTitle, IonContent, IonFooter, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonImg, IonCardContent, CommonModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  constructor() {}

  abrirPDF(tipo: string) {
    console.log('Abrir PDF:', tipo);
    // Aquí va tu lógica para abrir el PDF
  }
}
