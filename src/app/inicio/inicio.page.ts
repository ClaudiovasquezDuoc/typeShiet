import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonTitle, IonRow, IonCol, IonFooter } from '@ionic/angular/standalone';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, CommonModule, FormsModule, IonRow, IonCol, IonFooter]
})
export class InicioPage implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // Esperar 3 segundos y redirigir a home
    setTimeout(() => {
      this.router.navigate(['/home']);
    }, 3000);
  }

}
