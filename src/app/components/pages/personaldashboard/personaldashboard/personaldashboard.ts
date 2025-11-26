import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import Chart from 'chart.js/auto';


@Component({
  selector: 'app-personaldashboard',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './personaldashboard.html',
  styleUrl: './personaldashboard.css'
})
export class Personaldashboard implements OnInit {



   isAddWidgetPopup: boolean = false;

  openAddWidgetPopup() {
    this.isAddWidgetPopup = true;
  }
  closeAddWidgetPopup() {
    this.isAddWidgetPopup = false;
  }


   personalWidgets = [
    { name: 'Worked This Week', selected: false },
    { name: 'Worked Today', selected: false },
    { name: 'Battery Status', selected: false },
    { name: 'Type of People', selected: false },
    { name: 'Building and Floor', selected: false },
    { name: 'Average Hours / Member', selected: false },
    { name: 'Field Status', selected: false },
    { name: 'Total No.of Zone', selected: false },
    { name: 'Recent Activity', selected: false },
    { name: 'Projects', selected: false },
    { name: 'Alerts', selected: false },
    { name: 'Time Sheet', selected: false },
    { name: 'Man Down', selected: false },
    { name: 'Reader Status', selected: false },
    { name: 'Reader Type', selected: false },
    { name: 'SOS', selected: false },
    { name: 'Evacuation and Mustering', selected: false },
    { name: 'Top Exit Point', selected: false }
  ];




 ws!: WebSocket;
  chart!: Chart;

  zoneColorMap: any = {
    "Zone1": "#4caf50",
    "Zone2": "#f44336",
    "Zone3": "#2196f3",
    "Zone4": "#ff9800"
  };

  ngOnInit() {
    this.createChart();
    this.connectWS();
  }

  createChart() {
    const canvas = document.getElementById('zoneChart') as HTMLCanvasElement;

    this.chart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'People Count',
          data: [],
          borderRadius: 12,
          backgroundColor: []
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }},
        scales: {
          x: { grid: { display: false }},
          y: { grid: { color: '#e0e0e0' }}
        }
      }
    });
  }

  connectWS() {
    //this.ws = new WebSocket('ws://172.16.100.26:5202/ws/ZoneCount');
     this.ws = new WebSocket('wss://phcc.purpleiq.ai/ws/ZoneCount');

    this.ws.onmessage = (event) => {
      if (event.data.includes('ping')) return;

      const zones = JSON.parse(event.data);

      const labels = zones.map((z: any) => z.ZoneId);
      const values = zones.map((z: any) => z.Count);
      const colors = zones.map((z: any) =>
        this.zoneColorMap[z.ZoneId] || this.randomColor()
      );

      this.chart.data.labels = labels;
      this.chart.data.datasets[0].data = values;
      this.chart.data.datasets[0].backgroundColor = colors;

      this.chart.update();
    };
  }

  randomColor() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16);
  }
}
