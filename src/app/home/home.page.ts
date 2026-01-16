import { Component } from '@angular/core';
import { IonHeader, IonTitle, IonToolbar, IonContent, IonFooter, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, ActionSheetController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { FileOpener } from '@capacitor-community/file-opener';
import { Filesystem, Directory } from '@capacitor/filesystem';

interface Servicio {
  id: string;
  nombre: string;
  icono: string;
}

interface ConfiguracionBanco {
  nombre: string;
  pdf: string;
  servicios: string[]; // Array de IDs de servicios
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonHeader, IonTitle, IonToolbar, IonContent, IonFooter, IonRow, IonCol, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonImg, CommonModule],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  // Definir todos los servicios disponibles
  private serviciosDisponibles: { [key: string]: Servicio } = {
    'instalacion_pilar': {
      id: 'instalacion_pilar',
      nombre: 'Instalación de Pilar',
      icono: '📍'
    },
    'retiro_pilar': {
      id: 'retiro_pilar',
      nombre: 'Retiro de Pilar',
      icono: '🗑️'
    },
    'instalacion_atm': {
      id: 'instalacion_atm',
      nombre: 'Instalación de ATM',
      icono: '🏧'
    },
    'retiro_atm': {
      id: 'retiro_atm',
      nombre: 'Retiro de ATM',
      icono: '🗑️'
    },
    'servicio_tecnico': {
      id: 'servicio_tecnico',
      nombre: 'Servicio Técnico',
      icono: '🛠️'
    },
    'spa_atm': {
      id: 'spa_atm',
      nombre: 'SPA ATM',
      icono: '💆‍♂️'
    },
    'instalacion_depositario': {
      id: 'instalacion_depositario',
      nombre: 'Instalación de Depositario',
      icono: '🏦'
    },
    'retiro_depositario': {
      id: 'retiro_depositario',
      nombre: 'Retiro de Depositario',
      icono: '🗑️'
    }
  };

  // Configuración específica por banco
  private bancos: { [key: string]: ConfiguracionBanco } = {
    'banco_chile': {
      nombre: 'Banco de Chile',
      pdf: 'assets/pdfs/OT_Banco_Chile.pdf',
      servicios: ['instalacion_pilar', 'retiro_pilar', 'servicio_tecnico', 'spa_atm']
    },
    'banco_falabella': {
      nombre: 'Banco Falabella',
      pdf: 'assets/pdfs/OT_Banco_Falabella.pdf',
      servicios: ['instalacion_atm', 'instalacion_pilar']
    },
    'banco_itau': {
      nombre: 'Banco Itau',
      pdf: 'assets/pdfs/OT_Banco_Itau.pdf',
      servicios: ['instalacion_pilar', 'retiro_pilar']
    },
    'loomis': {
      nombre: 'Loomis',
      pdf: 'assets/pdfs/OT_Loomis.pdf',
      servicios: ['instalacion_depositario', 'retiro_depositario']
    },
    'banco_estado': {
      nombre: 'Banco Estado',
      pdf: 'assets/pdfs/OT_Banco_Estado.pdf',
      servicios: ['instalacion_pilar', 'retiro_pilar', 'instalacion_atm', 'retiro_atm', 'servicio_tecnico', 'spa_atm']
    },
    'vacia': {
      nombre: 'Orden de Trabajo Vacía',
      pdf: 'assets/pdfs/OT_Vacia.pdf',
      servicios: ['instalacion_pilar', 'retiro_pilar', 'instalacion_atm', 'retiro_atm', 'servicio_tecnico', 'spa_atm']
    }
  };

  constructor(private actionSheetCtrl: ActionSheetController) {}

  async abrirPDF(tipo: string) {
    const configuracion = this.bancos[tipo];

    if (!configuracion) {
      alert('Configuración no encontrada para este banco.');
      return;
    }

    // Obtener solo los servicios habilitados para este banco
    const botonesServicios = configuracion.servicios.map(servicioId => {
      const servicio = this.serviciosDisponibles[servicioId];
      return {
        text: `${servicio.icono} ${servicio.nombre}`,
        handler: () => {
          this.procesarServicio(tipo, servicioId);
        }
      };
    });

    // Agregar botón de cancelar
    botonesServicios.push({
      text: 'Cancelar',
      handler: () => {}
    });

    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecciona el tipo de servicio',
      subHeader: `Trabajando con: ${configuracion.nombre}`,
      buttons: botonesServicios
    });

    await actionSheet.present();
  }

  private async procesarServicio(banco: string, servicio: string) {
    try {
      const configuracion = this.bancos[banco];
      
      if (!configuracion) {
        alert('Configuración no encontrada.');
        return;
      }

      // Copiar el PDF a la carpeta de documentos del dispositivo
      const fileName = `OT_${servicio}_${banco}_${Date.now()}.pdf`;
      const file = await fetch(configuracion.pdf).then(res => res.blob());
      
      const savedFile = await Filesystem.writeFile({
        path: fileName,
        data: file,
        directory: Directory.Documents,
      });

      // Mostrar opciones para abrir con aplicación
      await this.mostrarOpcionesAplicaciones(savedFile.uri);

    } catch (error) {
      console.error('Error al procesar PDF:', error);
      alert('Error al procesar el PDF.');
    }
  }

  private async mostrarOpcionesAplicaciones(filePath: string) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Selecciona la aplicación',
      buttons: [
        {
          text: '📖 Adobe Acrobat Reader',
          handler: () => this.abrirConAplicacion(filePath, 'com.adobe.reader')
        },
        {
          text: '📄 Google PDF Viewer',
          handler: () => this.abrirConAplicacion(filePath, 'com.google.android.apps.docs')
        },
        {
          text: '📱 Aplicación predeterminada',
          handler: () => this.abrirConAplicacionPredeterminada(filePath)
        },
        {
          text: 'Cancelar',
          handler: () => {}
        }
      ]
    });

    await actionSheet.present();
  }

  private async abrirConAplicacion(filePath: string, packageName: string) {
    try {
      await FileOpener.open({
        filePath: filePath,
        contentType: 'application/pdf'
      });
    } catch (error) {
      console.error('Error:', error);
      this.abrirConAplicacionPredeterminada(filePath);
    }
  }

  private async abrirConAplicacionPredeterminada(filePath: string) {
    try {
      await FileOpener.open({
        filePath: filePath,
        contentType: 'application/pdf'
      });
    } catch (error) {
      console.error('Error al abrir PDF:', error);
      alert('Error al abrir el archivo.');
    }
  }
}
