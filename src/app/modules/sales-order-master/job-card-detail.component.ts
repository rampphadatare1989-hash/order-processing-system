import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderItem } from '../../models/sales-order.model';
import { Product } from '../../models/product.model';
import { PDIReportComponent } from './pdi-report.component';
import { JobCardReportComponent } from './job-card-report.component';

@Component({
  selector: 'app-job-card-detail',
  standalone: true,
  imports: [CommonModule, PDIReportComponent, JobCardReportComponent],
  template: `
    <div class="job-card-detail" *ngIf="item">
      <div class="report-actions no-print">
        <app-pdi-report [item]="item"></app-pdi-report>
        <app-job-card-report [item]="item"></app-job-card-report>
      </div>
      <div class="details-grid">
        <aside class="summary-card">
          <h3 class="card-title">Job Card Summary</h3>
          <div class="kv"><div class="k">Job Card No</div><div class="v">{{ item.jobCardNumber }}</div></div>
          <div class="kv"><div class="k">Product Name</div><div class="v">{{ item.productName }}</div></div>
          <div class="kv"><div class="k">Product Type</div><div class="v">{{ getProductTypeFullName(item.productType) }}</div></div>
          <div class="kv"><div class="k">Quantity</div><div class="v">{{ item.quantity }}</div></div>
          <hr>
          <h4 class="card-sub">Part Information</h4>
          <div class="kv small" *ngIf="item.product?.general?.symagPartNo"><div class="k">Symag Part No</div><div class="v">{{ item.product?.general?.symagPartNo }}</div></div>
          <div class="kv small" *ngIf="item.product?.general?.moq"><div class="k">MOQ</div><div class="v">{{ item.product?.general?.moq }}</div></div>
        </aside>
        <section class="details-column">
          <div class="detail-card" *ngIf="item.product?.materialAndDimensions">
            <h4 class="section-title">Dimensions</h4>
            <div class="detail-grid two-cols">
              <ng-container *ngIf="item.product?.materialAndDimensions?.wireDia">
                <div class="detail-item"><span class="label">Wire Dia</span><span class="value">{{ item.product?.materialAndDimensions?.wireDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.wireDia?.tolerance_mm }} mm</span></div>
              </ng-container>
              <ng-container *ngIf="item.product?.materialAndDimensions?.outsideDia">
                <div class="detail-item"><span class="label">Outside Dia</span><span class="value">{{ item.product?.materialAndDimensions?.outsideDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.outsideDia?.tolerance_mm }} mm</span></div>
              </ng-container>
              <ng-container *ngIf="item.product?.materialAndDimensions?.meanDia">
                <div class="detail-item"><span class="label">Mean Dia</span><span class="value">{{ item.product?.materialAndDimensions?.meanDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.meanDia?.tolerance_mm }} mm</span></div>
              </ng-container>
              <ng-container *ngIf="item.product?.materialAndDimensions?.insideDia">
                <div class="detail-item"><span class="label">Inside Dia</span><span class="value">{{ item.product?.materialAndDimensions?.insideDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.insideDia?.tolerance_mm }} mm</span></div>
              </ng-container>
              <ng-container *ngIf="item.product?.materialAndDimensions?.freeLength">
                <div class="detail-item"><span class="label">Free Length</span><span class="value">{{ item.product?.materialAndDimensions?.freeLength?.value_mm }} ± {{ item.product?.materialAndDimensions?.freeLength?.tolerance_mm }} mm</span></div>
              </ng-container>
              <ng-container *ngIf="item.product?.materialAndDimensions?.bigOutsideDia">
                <div class="detail-item"><span class="label">Big Outside Dia</span><span class="value">{{ item.product?.materialAndDimensions?.bigOutsideDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.bigOutsideDia?.tolerance_mm }} mm</span></div>
              </ng-container>
              <ng-container *ngIf="item.product?.materialAndDimensions?.smallOutsideDia">
                <div class="detail-item"><span class="label">Small Outside Dia</span><span class="value">{{ item.product?.materialAndDimensions?.smallOutsideDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.smallOutsideDia?.tolerance_mm }} mm</span></div>
              </ng-container>
            </div>
          </div>
          <div class="detail-card" *ngIf="item.product?.materialAndDimensions?.heatTreat || item.product?.materialAndDimensions?.worksInside || item.product?.materialAndDimensions?.worksOver">
            <h4 class="section-title">Works & Heat Treatment</h4>
            <div class="detail-grid two-cols">
              <div *ngIf="item.product?.materialAndDimensions?.worksInside" class="detail-item"><span class="label">Works Inside - Hole Dia</span><span class="value">{{ item.product?.materialAndDimensions?.worksInside?.holeDia_mm || '—' }} mm</span></div>
              <div *ngIf="item.product?.materialAndDimensions?.worksOver" class="detail-item"><span class="label">Works Over - Shaft Dia</span><span class="value">{{ item.product?.materialAndDimensions?.worksOver?.shaftDia_mm || '—' }} mm</span></div>
              <div *ngIf="item.product?.materialAndDimensions?.heatTreat?.degree_C" class="detail-item"><span class="label">Heat Treat (°C)</span><span class="value">{{ item.product?.materialAndDimensions?.heatTreat?.degree_C }}</span></div>
              <div *ngIf="item.product?.materialAndDimensions?.heatTreat?.time_min" class="detail-item"><span class="label">Heat Treat Time (min)</span><span class="value">{{ item.product?.materialAndDimensions?.heatTreat?.time_min }}</span></div>
            </div>
          </div>
          <div class="detail-card" *ngIf="item.product?.loadsRatesDeflection">
            <h4 class="section-title">Loads · Rates · Deflection</h4>
            <div class="detail-grid two-cols">
              <div *ngIf="item.product?.loadsRatesDeflection?.springRate" class="detail-item"><span class="label">Spring Rate</span><span class="value">{{ item.product?.loadsRatesDeflection?.springRate?.value_N_per_mm }} ± {{ item.product?.loadsRatesDeflection?.springRate?.tolerance_N_per_mm }} N/mm</span></div>
              <div *ngIf="item.product?.loadsRatesDeflection?.solidHeight" class="detail-item"><span class="label">Solid Height</span><span class="value">{{ item.product?.loadsRatesDeflection?.solidHeight?.value_mm }} ± {{ item.product?.loadsRatesDeflection?.solidHeight?.tolerance_mm }} mm</span></div>
              <div *ngIf="item.product?.loadsRatesDeflection?.lengthAtLoad1_mm" class="detail-item"><span class="label">Length @ Load1</span><span class="value">{{ item.product?.loadsRatesDeflection?.lengthAtLoad1_mm }} mm</span></div>
              <div *ngIf="item.product?.loadsRatesDeflection?.load1_N" class="detail-item"><span class="label">Load 1</span><span class="value">{{ item.product?.loadsRatesDeflection?.load1_N }} N</span></div>
              <div *ngIf="item.product?.loadsRatesDeflection?.lengthAtLoad2_mm" class="detail-item"><span class="label">Length @ Load2</span><span class="value">{{ item.product?.loadsRatesDeflection?.lengthAtLoad2_mm }} mm</span></div>
              <div *ngIf="item.product?.loadsRatesDeflection?.load2_N" class="detail-item"><span class="label">Load 2</span><span class="value">{{ item.product?.loadsRatesDeflection?.load2_N }} N</span></div>
              <div *ngIf="item.product?.loadsRatesDeflection?.deflectionAtLoad1_mm" class="detail-item"><span class="label">Deflection @ Load1</span><span class="value">{{ item.product?.loadsRatesDeflection?.deflectionAtLoad1_mm }} mm</span></div>
              <div *ngIf="item.product?.loadsRatesDeflection?.deflectionAtLoad2_mm" class="detail-item"><span class="label">Deflection @ Load2</span><span class="value">{{ item.product?.loadsRatesDeflection?.deflectionAtLoad2_mm }} mm</span></div>
            </div>
          </div>
          <div class="detail-card" *ngIf="item.product?.loadsRatesDeflection">
            <h4 class="section-title">Operating Conditions & Metadata</h4>
            <div class="detail-grid two-cols">
              <div class="detail-item"><span class="label">Operating Temp</span><span class="value">{{ item.product?.loadsRatesDeflection?.operatingTemp_C ? (item.product?.loadsRatesDeflection?.operatingTemp_C + ' °C') : '—' }}</span></div>
              <div class="detail-item"><span class="label">Cycles</span><span class="value">{{ item.product?.loadsRatesDeflection?.cycles || '—' }}</span></div>
              <div class="detail-item"><span class="label">Surface Treatment</span><span class="value">{{ item.product?.loadsRatesDeflection?.surfaceTreatment || '—' }}</span></div>
              <div *ngIf="item.product?.loadsRatesDeflection?.date" class="detail-item"><span class="label">Date</span><span class="value">{{ item.product?.loadsRatesDeflection?.date }}</span></div>
              <div *ngIf="item.product?.loadsRatesDeflection?.prepBy" class="detail-item"><span class="label">Prepared By</span><span class="value">{{ item.product?.loadsRatesDeflection?.prepBy }}</span></div>
            </div>
          </div>
          <div *ngIf="item.product?.loadsRatesDeflection?.remark" class="detail-card full-width">
            <h4 class="section-title">Remarks</h4>
            <div class="remark-box">{{ item.product?.loadsRatesDeflection?.remark }}</div>
          </div>
          <!-- Additional Sections at the end -->
          <div class="detail-card full-width">
            <h4 class="section-title">Sections</h4>
            <div class="remark-box">Add any additional section content here as needed.</div>
          </div>
          <!-- Product Images Section at the end for print -->
          <div class="detail-card product-images-section print-images" *ngIf="item.product?.images?.length">
            <h4 class="section-title">Product Images</h4>
            <div class="images-list">
              <img *ngFor="let img of item.product?.images" [src]="img" alt="Product Image"
                class="product-image print-image"
                (mouseover)="magnify($event)" (mouseout)="resetImage($event)"
                (mousedown)="minify($event)" (mouseup)="resetImage($event)">
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
        @media print {
          .no-print { display: none !important; }
          .job-card-detail {
            background: #fff !important;
            color: #000 !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .details-grid {
            padding: 0 !important;
            gap: 8px !important;
          }
          .detail-card, .summary-card {
            box-shadow: none !important;
            border: 1px solid #bbb !important;
            background: #fff !important;
            page-break-inside: avoid;
          }
          .product-images-section.print-images {
            margin-top: 24px !important;
            page-break-before: always;
            text-align: center;
          }
          .product-image.print-image {
            width: 120px !important;
            height: 120px !important;
            margin: 8px !important;
            border: 1px solid #888 !important;
            box-shadow: none !important;
            background: #fff !important;
            object-fit: contain !important;
          }
          .section-title, .images-title {
            color: #000 !important;
            font-size: 16px !important;
            font-weight: bold !important;
            margin-bottom: 12px !important;
          }
        }
    .job-card-detail {
      .product-images-section {
        margin-bottom: 24px;
        .images-title {
          font-size: 15px;
          font-weight: 700;
          color: #0b3d91;
          margin-bottom: 8px;
        }
        .images-list {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .product-image {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 6px;
          border: 1px solid #e6eefc;
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
          background: #f8fafc;
        }
      }
      padding: 0;
      background: #ffffff;

      .report-actions {
        padding: 16px 24px;
        border-bottom: 1px solid #e6eefc;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: #f9fbfd;
      }

      .details-grid {
        display: grid;
        grid-template-columns: 320px 1fr;
        gap: 24px;
        align-items: start;
        padding: 24px;
      }

      aside.summary-card {
        background: linear-gradient(180deg, #fbfdff 0%, #f7fbff 100%);
        border: 1px solid #dbeafe;
        padding: 16px;
        border-radius: 6px;
        box-shadow: 0 2px 6px rgba(11, 78, 215, 0.06);

        .card-title {
          font-size: 16px;
          font-weight: 800;
          color: #08306b;
          text-align: center;
          margin: 0 0 8px 0;
        }

        .kv {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px dashed #e6eefc;

          &.small {
            padding: 6px 0;
          }

          .k {
            font-weight: 700;
            color: #0b3d91;
            font-size: 13px;
          }

          .v {
            color: #0f172a;
            font-weight: 600;
            text-align: right;
          }
        }

        hr {
          border: none;
          border-top: 1px solid #dbeafe;
          margin: 12px 0;
        }

        .card-sub {
          font-size: 12px;
          font-weight: 800;
          color: #0b3d91;
          margin: 12px 0 8px 0;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
      }

      .details-column {
        .detail-card {
          background: #ffffff;
          border: 1px solid #e6eefc;
          border-radius: 6px;
          padding: 14px;
          margin-bottom: 16px;
          box-shadow: 0 1px 3px rgba(2, 6, 23, 0.04);

          .section-title {
            font-size: 14px;
            color: #0b3d91;
            font-weight: 800;
            border-bottom: 2px solid #e6f0ff;
            padding-bottom: 8px;
            margin: 0 0 12px 0;
          }

          .detail-grid.two-cols {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .detail-item {
            display: flex;
            flex-direction: column;
            padding: 8px;
            border-radius: 4px;
            background: #fbfdff;
            border: 1px solid #eef6ff;

            .label {
              font-size: 12px;
              color: #334155;
              font-weight: 700;
              margin-bottom: 6px;
            }

            .value {
              font-size: 13px;
              color: #0f172a;
              font-weight: 700;
            }
          }

          &.full-width {
            grid-column: 1 / -1;
          }
        }
      }

      .remark-box {
        background: #fff;
        border: 1px solid #e6eefc;
        padding: 12px;
        border-radius: 6px;
        min-height: 64px;
        color: #0f172a;
        line-height: 1.5;
      }

      @media (max-width: 900px) {
        .details-grid {
          grid-template-columns: 1fr;
        }

        .detail-grid.two-cols {
          grid-template-columns: 1fr;
        }

        aside.summary-card {
          order: -1;
        }
      }

      @media (max-width: 768px) {
        aside.summary-card {
          padding: 12px;
          font-size: 12px;
        }

        .detail-grid.two-cols {
          grid-template-columns: 1fr;
        }

        .detail-item {
          padding: 6px !important;
          .label {
            font-size: 11px !important;
          }
          .value {
            font-size: 12px !important;
          }
        }
      }
    }
  `]
})
export class JobCardDetailComponent {
    magnify(event: MouseEvent) {
      const img = event.target as HTMLImageElement;
      img.style.transform = 'scale(2)';
      img.style.zIndex = '10';
      img.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
    }
    minify(event: MouseEvent) {
      const img = event.target as HTMLImageElement;
      img.style.transform = 'scale(0.7)';
      img.style.zIndex = '10';
      img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
    }
    resetImage(event: MouseEvent) {
      const img = event.target as HTMLImageElement;
      img.style.transform = 'scale(1)';
      img.style.zIndex = '';
      img.style.boxShadow = '';
    }
  @Input() item!: SalesOrderItem;

  getProductTypeFullName(type: string): string {
    const names: { [key: string]: string } = {
      'CS': 'Compression Spring',
      'CCS': 'Conical Compression Spring',
      'ES': 'Extension Spring',
      'TS': 'Torsion Spring',
      'DTS': 'Double Torsion Spring',
      'WF': 'WireForm',
      'PP': 'Press Part'
    };
    return names[type] || type;
  }
}
