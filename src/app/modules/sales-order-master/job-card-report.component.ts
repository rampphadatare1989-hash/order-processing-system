import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderItem } from '../../models/sales-order.model';

@Component({
  selector: 'app-job-card-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="job-card-report-container">
      <button class="btn-generate-report" (click)="openJobCardReport()" title="View Job Card Report">
        📋 Job Card Report
      </button>

      <!-- Job Card Report Modal -->
      <div *ngIf="showJobCardReport" class="modal-overlay" (click)="closeJobCardReport()">
        <div class="modal-content job-card-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Job Card Detailed Report</h2>
            <div class="header-actions">
              <button class="btn-print" (click)="printReport()" title="Print Report">🖨️ Print</button>
              <button class="close-btn" (click)="closeJobCardReport()">✕</button>
            </div>
          </div>

          <div class="modal-body" id="job-card-report-print">
            <div class="report-container">
              <!-- Header -->
              <div class="report-header">
                <div class="logo-section">
                  <div class="company-logo">SYMAG</div>
                </div>
                <div class="title-section">
                  <h1>JOB CARD DETAIL REPORT</h1>
                </div>
              </div>

              <!-- Job Card Title -->
              <div class="job-card-title">
                {{ getProductTypeFullName(item.productType) }}
              </div>

             
              <!-- Main Info Section -->
              <div class="main-info-grid">
                <div class="info-block">
                  <h3>Job Card Information</h3>
                  <div class="info-detail">
                    <label>Job Card Number</label>
                    <span>{{ item.jobCardNumber }}</span>
                  </div>
                  <div class="info-detail">
                    <label>Product Name</label>
                    <span>{{ item.productName }}</span>
                  </div>
                  <div class="info-detail">
                    <label>Product Type</label>
                    <span>{{ getProductTypeFullName(item.productType) }}</span>
                  </div>
                  <div class="info-detail">
                    <label>Quantity</label>
                    <span>{{ item.quantity }} pcs</span>
                  </div>
                  <div class="info-detail">
                    <label>Report Date</label>
                    <span>{{ getCurrentDate() }}</span>
                  </div>
                </div>

                <div class="info-block">
                  <h3>Part Information</h3>
                  <div class="info-detail" *ngIf="item.product?.general?.symagPartNo">
                    <label>Symag Part No</label>
                    <span>{{ item.product?.general?.symagPartNo }}</span>
                  </div>
                  <div class="info-detail" *ngIf="item.product?.general?.partWeightNet">
                    <label>Part Weight (Net)</label>
                    <span>{{ item.product?.general?.partWeightNet }} kg</span>
                  </div>
                  <div class="info-detail" *ngIf="item.product?.general?.moq">
                    <label>MOQ</label>
                    <span>{{ item.product?.general?.moq }}</span>
                  </div>
                  <div class="info-detail" *ngIf="item.product?.materialAndDimensions?.materialType">
                    <label>Material Type</label>
                    <span>{{ item.product?.materialAndDimensions?.materialType }}</span>
                  </div>
                  <div class="info-detail" *ngIf="item.product?.materialAndDimensions?.mtlSpec">
                    <label>Material Spec</label>
                    <span>{{ item.product?.materialAndDimensions?.mtlSpec }}</span>
                  </div>
                </div>
              </div>

              <!-- Dimensions Section -->
              <div class="section" *ngIf="item.product?.materialAndDimensions">
                <h3>Dimensions & Specifications</h3>
                <div class="dimensions-grid">
                  <ng-container *ngIf="item.product?.materialAndDimensions?.wireDia">
                    <div class="dimension-item">
                      <div class="label">Wire Diameter</div>
                      <div class="value">{{ item.product?.materialAndDimensions?.wireDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.wireDia?.tolerance_mm }} mm</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.materialAndDimensions?.outsideDia">
                    <div class="dimension-item">
                      <div class="label">Outside Diameter</div>
                      <div class="value">{{ item.product?.materialAndDimensions?.outsideDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.outsideDia?.tolerance_mm }} mm</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.materialAndDimensions?.meanDia">
                    <div class="dimension-item">
                      <div class="label">Mean Diameter</div>
                      <div class="value">{{ item.product?.materialAndDimensions?.meanDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.meanDia?.tolerance_mm }} mm</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.materialAndDimensions?.insideDia">
                    <div class="dimension-item">
                      <div class="label">Inside Diameter</div>
                      <div class="value">{{ item.product?.materialAndDimensions?.insideDia?.value_mm }} ± {{ item.product?.materialAndDimensions?.insideDia?.tolerance_mm }} mm</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.materialAndDimensions?.freeLength">
                    <div class="dimension-item">
                      <div class="label">Free Length</div>
                      <div class="value">{{ item.product?.materialAndDimensions?.freeLength?.value_mm }} ± {{ item.product?.materialAndDimensions?.freeLength?.tolerance_mm }} mm</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.materialAndDimensions?.solidHeight">
                    <div class="dimension-item">
                      <div class="label">Solid Height</div>
                      <div class="value">{{ item.product?.materialAndDimensions?.solidHeight?.value_mm }} ± {{ item.product?.materialAndDimensions?.solidHeight?.tolerance_mm }} mm</div>
                    </div>
                  </ng-container>
                </div>
              </div>

              <!-- Coil Configuration -->
              <div class="section" *ngIf="item.product?.materialAndDimensions?.totalCoils || item.product?.materialAndDimensions?.helix">
                <h3>Coil Configuration</h3>
                <div class="config-grid">
                  <div class="config-item" *ngIf="item.product?.materialAndDimensions?.totalCoils">
                    <div class="label">Total Coils</div>
                    <div class="value">{{ item.product?.materialAndDimensions?.totalCoils }}</div>
                  </div>
                  <div class="config-item" *ngIf="item.product?.materialAndDimensions?.helix">
                    <div class="label">Helix</div>
                    <div class="value">{{ item.product?.materialAndDimensions?.helix }}</div>
                  </div>
                  <div class="config-item" *ngIf="item.product?.materialAndDimensions?.preset">
                    <div class="label">Preset</div>
                    <div class="value">{{ item.product?.materialAndDimensions?.preset ? 'Yes' : 'No' }}</div>
                  </div>
                </div>
              </div>

              <!-- Loads & Spring Rate -->
              <div class="section" *ngIf="item.product?.loadsRatesDeflection">
                <h3>Loads · Spring Rate · Deflection</h3>
                <div class="loads-grid">
                  <ng-container *ngIf="item.product?.loadsRatesDeflection?.springRate">
                    <div class="load-item">
                      <div class="label">Spring Rate</div>
                      <div class="value">{{ item.product?.loadsRatesDeflection?.springRate?.value_N_per_mm }} ± {{ item.product?.loadsRatesDeflection?.springRate?.tolerance_N_per_mm }} N/mm</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.loadsRatesDeflection?.load1_N">
                    <div class="load-item">
                      <div class="label">Load 1</div>
                      <div class="value">{{ item.product?.loadsRatesDeflection?.load1_N }} N</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.loadsRatesDeflection?.load2_N">
                    <div class="load-item">
                      <div class="label">Load 2</div>
                      <div class="value">{{ item.product?.loadsRatesDeflection?.load2_N }} N</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.loadsRatesDeflection?.operatingTemp_C">
                    <div class="load-item">
                      <div class="label">Operating Temperature</div>
                      <div class="value">{{ item.product?.loadsRatesDeflection?.operatingTemp_C }} °C</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.loadsRatesDeflection?.cycles">
                    <div class="load-item">
                      <div class="label">Cycles</div>
                      <div class="value">{{ item.product?.loadsRatesDeflection?.cycles }}</div>
                    </div>
                  </ng-container>
                  <ng-container *ngIf="item.product?.loadsRatesDeflection?.surfaceTreatment">
                    <div class="load-item">
                      <div class="label">Surface Treatment</div>
                      <div class="value">{{ item.product?.loadsRatesDeflection?.surfaceTreatment }}</div>
                    </div>
                  </ng-container>
                </div>
              </div>

              <!-- Remarks -->
              <div class="section" *ngIf="item.product?.loadsRatesDeflection?.remark">
                <h3>Remarks</h3>
                <div class="remark-box">
                  {{ item.product?.loadsRatesDeflection?.remark }}
                </div>
              </div>
 <!-- Product Images Section -->
              <div class="product-images-section" *ngIf="item.product?.images?.length">
                <div class="images-title">Product Images</div>
                <div class="images-list">
                  <img *ngFor="let img of item.product.images" [src]="img" alt="Product Image"
                       class="product-image"
                       
                       >
                </div>
              </div>
              <!-- Footer Info -->
              <div class="footer-info">
                <div class="footer-item">
                  <label>Prepared By:</label>
                  <div class="signature-line"></div>
                </div>
                <div class="footer-item">
                  <label>Verified By:</label>
                  <div class="signature-line"></div>
                </div>
                <div class="footer-item">
                  <label>Date:</label>
                  <div class="signature-line"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="closeJobCardReport()">Close</button>
            <button class="btn-print" (click)="printReport()">🖨️ Print Report</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .job-card-report-container {
      .btn-generate-report {
        background: linear-gradient(135deg, #28a745 0%, #1e7e34 100%);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 600;
        font-size: 14px;
        transition: transform 0.2s ease, box-shadow 0.2s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);
        }
      }
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-content.job-card-modal {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      width: 95%;
      max-width: 1000px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 2px solid #28a745;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #155724;
        }

        .header-actions {
          display: flex;
          gap: 12px;

          .btn-print {
            background: #28a745;
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;

            &:hover {
              background: #1e7e34;
            }
          }

          .close-btn {
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #6c757d;

            &:hover {
              color: #000;
            }
          }
        }
      }

      .modal-body {
        flex: 1;
        overflow-y: auto;
        padding: 24px;
        background: white;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 24px;
        border-top: 1px solid #e9ecef;
        background: #f8f9fa;

        .btn-secondary {
          background: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;

          &:hover {
            background: #5a6268;
          }
        }

        .btn-print {
          background: #28a745;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;

          &:hover {
            background: #1e7e34;
          }
        }
      }
    }

    .report-container {
      font-family: 'Arial', sans-serif;
      background: white;

      .report-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        border-bottom: 3px solid #28a745;
        padding-bottom: 12px;

        .logo-section {
          margin-right: 40px;

          .company-logo {
            font-size: 18px;
            font-weight: 800;
            color: #155724;
            background: #d4edda;
            padding: 8px 16px;
            border-radius: 4px;
            text-align: center;
            min-width: 80px;
          }
        }

        .title-section {
          flex: 1;

          h1 {
            margin: 0;
            font-size: 18px;
            font-weight: 800;
            color: #155724;
            text-align: center;
            letter-spacing: 0.5px;
          }
        }
      }

      .job-card-title {
        text-align: center;
        font-size: 16px;
        font-weight: 700;
        color: #155724;
        margin: 16px 0;
        padding: 8px;
        border-bottom: 2px solid #28a745;
      }

      .main-info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin: 20px 0;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 6px;

        .info-block {
          h3 {
            margin: 0 0 14px 0;
            font-size: 13px;
            font-weight: 700;
            color: #155724;
            border-bottom: 2px solid #28a745;
            padding-bottom: 10px;
            letter-spacing: 0.4px;
          }

          .info-detail {
            display: grid;
            grid-template-columns: 140px 1fr;
            gap: 12px;
            padding: 10px 0;
            border-bottom: 1px solid #e9ecef;

            &:last-child {
              border-bottom: none;
            }

            label {
              font-weight: 600;
              color: #666;
              font-size: 11px;
              letter-spacing: 0.3px;
              text-transform: uppercase;
            }

            span {
              color: #000;
              font-weight: 700;
              font-size: 13px;
              line-height: 1.4;
            }
          }
        }
      }

      .section {
        margin: 20px 0;
        padding: 16px;
        border: 1px solid #d4edda;
        border-radius: 6px;
        background: #f8fff9;

        h3 {
          margin: 0 0 14px 0;
          font-size: 13px;
          font-weight: 700;
          color: #155724;
          border-bottom: 2px solid #28a745;
          padding-bottom: 10px;
          letter-spacing: 0.4px;
        }

        .dimensions-grid,
        .config-grid,
        .loads-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .dimension-item,
        .config-item,
        .load-item {
          padding: 12px;
          background: white;
          border: 1px solid #d4edda;
          border-radius: 4px;

          .label {
            font-weight: 600;
            color: #666;
            font-size: 10px;
            letter-spacing: 0.3px;
            text-transform: uppercase;
            margin-bottom: 6px;
            display: block;
          }

          .value {
            color: #000;
            font-weight: 700;
            font-size: 13px;
            line-height: 1.4;
          }

          span {
            color: #000;
            font-weight: 700;
            font-size: 13px;
            line-height: 1.4;
          }
        }
      }

      .remark-box {
        background: white;
        border: 1px solid #d4edda;
        padding: 14px;
        border-radius: 4px;
        min-height: 60px;
        color: #000;
        line-height: 1.6;
        font-size: 13px;
        font-weight: 500;
      }

      .footer-info {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 40px;
        margin-top: 40px;
        padding-top: 20px;

        .footer-item {
          display: flex;
          flex-direction: column;
          gap: 8px;

          label {
            font-size: 12px;
            font-weight: 700;
            color: #000;
          }

          .signature-line {
            border-bottom: 1px solid #000;
            height: 40px;
          }
        }
      }
    }

    @media print {
      .modal-overlay {
        background: white;
      }

      .modal-content.job-card-modal {
        box-shadow: none;
        border: none;
        max-height: none;
        max-width: 100%;

        .modal-header,
        .modal-footer {
          display: none;
        }

        .modal-body {
          padding: 0;
          overflow: visible;
          max-height: none;
        }
      }

      .report-container {
        .section {
          page-break-inside: avoid;
        }
      }

      .btn-generate-report,
      .btn-print,
      .close-btn {
        display: none;
      }
    }

    @media (max-width: 900px) {
      .modal-content.job-card-modal {
        max-width: 100%;
        max-height: 95vh;
      }

      .report-container {
        .main-info-grid {
          grid-template-columns: 1fr;
        }

        .dimensions-grid,
        .config-grid,
        .loads-grid {
          grid-template-columns: 1fr;
        }

        .footer-info {
          grid-template-columns: 1fr;
          gap: 20px;
        }
      }
    }
  `]
})
export class JobCardReportComponent {
  @Input() item: any;
  showJobCardReport = false;

  openJobCardReport(): void {
    this.showJobCardReport = true;
  }

  closeJobCardReport(): void {
    this.showJobCardReport = false;
  }

  printReport(): void {
    const printContent = document.getElementById('job-card-report-print');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    document.body.innerHTML = printContent.innerHTML;
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
  }

  getCurrentDate(): string {
    const today = new Date();
    return today.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

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
  // Magnify/minify image handlers for product images
  onMagnify(event: MouseEvent) {
    const img = event.target as HTMLImageElement;
    img.style.transform = 'scale(2)';
    img.style.zIndex = '10';
    img.style.boxShadow = '0 4px 24px rgba(0,0,0,0.18)';
  }
  onMinify(event: MouseEvent) {
    const img = event.target as HTMLImageElement;
    img.style.transform = 'scale(0.7)';
    img.style.zIndex = '10';
    img.style.boxShadow = '0 2px 8px rgba(0,0,0,0.10)';
  }
  onResetImage(event: MouseEvent) {
    const img = event.target as HTMLImageElement;
    img.style.transform = 'scale(1)';
    img.style.zIndex = '';
    img.style.boxShadow = '';
  }
}
