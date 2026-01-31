import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SalesOrderItem } from '../../models/sales-order.model';

@Component({
  selector: 'app-pdi-report',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pdi-report-container">
      <button class="btn-generate-pdi" (click)="openPDIReport()" title="View PDI Report">
        📋 View PDI Report
      </button>

      <!-- PDI Report Modal -->
      <div *ngIf="showPDIReport" class="modal-overlay" (click)="closePDIReport()">
        <div class="modal-content pdi-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>PDI Report</h2>
            <div class="header-actions">
              <button class="btn-print" (click)="printReport()" title="Print Report">🖨️ Print</button>
              <button class="close-btn" (click)="closePDIReport()">✕</button>
            </div>
          </div>

          <div class="modal-body" id="pdi-report-print">
            <div class="report-container">
              <!-- Header -->
              <div class="report-header">
                <div class="logo-section">
                  <div class="symag-logo">SYMAG</div>
                </div>
                <div class="title-section">
                  <h1>PDI REPORTS / INSPECTION REPORTS</h1>
                </div>
              </div>

              <!-- Product Title -->
              <div class="product-title">
                {{ getProductTypeFullName(item.productType) }}
              </div>

              <!-- Header Info Grid -->
              <div class="header-info">
                <div class="info-row">
                  <div class="info-item">
                    <label>Report No</label>
                    <div class="value">{{ item.jobCardNumber }}</div>
                  </div>
                  <div class="info-item">
                    <label>Date</label>
                    <div class="value">{{ getCurrentDate() }}</div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-item">
                    <label>Customer Code</label>
                    <div class="value">-</div>
                  </div>
                  <div class="info-item">
                    <label>Customer Part No</label>
                    <div class="value">-</div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-item">
                    <label>Symag Job No</label>
                    <div class="value">{{ item.jobCardNumber }}</div>
                  </div>
                  <div class="info-item">
                    <label>Symag Item Code</label>
                    <div class="value">{{ item.product?.general?.symagPartNo || '-' }}</div>
                  </div>
                </div>
                <div class="info-row">
                  <div class="info-item">
                    <label>Material Grade</label>
                    <div class="value">{{ item.product?.materialAndDimensions?.materialType || '-' }}</div>
                  </div>
                  <div class="info-item">
                    <label>Mtc No</label>
                    <div class="value">{{ item.product?.materialAndDimensions?.mtlSpec || '-' }}</div>
                  </div>
                </div>
              </div>

              <!-- Specifications Table -->
              <div class="specifications-section">
                <h3>Specification</h3>
                <table class="spec-table">
                  <thead>
                    <tr>
                      <th class="sr-no">Sr. No</th>
                      <th class="parameter">Parameter</th>
                      <th class="symbol">Symbol</th>
                      <th colspan="3" class="specification-header">Specification</th>
                      <th colspan="5" class="observed-header">Observed</th>
                    </tr>
                    <tr>
                      <th colspan="3"></th>
                      <th>Standard</th>
                      <th>Minimum</th>
                      <th>Maximum</th>
                      <th>1</th>
                      <th>2</th>
                      <th>3</th>
                      <th>4</th>
                      <th>5</th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Wire Diameter -->
                    <tr *ngIf="item.product?.materialAndDimensions?.wireDia">
                      <td class="sr-no">1</td>
                      <td class="parameter">Wire Diameter (mm)</td>
                      <td class="symbol">d</td>
                      <td>{{ item.product?.materialAndDimensions?.wireDia?.value_mm }}</td>
                      <td>{{ '-' }}</td>
                      <td>{{ '+' }}{{ item.product?.materialAndDimensions?.wireDia?.tolerance_mm }}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <!-- Mean Coil Diameter -->
                    <tr *ngIf="item.product?.materialAndDimensions?.meanDia">
                      <td class="sr-no">2</td>
                      <td class="parameter">Mean Coil Diameter (mm)</td>
                      <td class="symbol">Dm</td>
                      <td>{{ item.product?.materialAndDimensions?.meanDia?.value_mm }}</td>
                      <td>{{ '-' }}</td>
                      <td>{{ '+' }}{{ item.product?.materialAndDimensions?.meanDia?.tolerance_mm }}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <!-- Outer Diameter -->
                    <tr *ngIf="item.product?.materialAndDimensions?.outsideDia">
                      <td class="sr-no">3</td>
                      <td class="parameter">Outer Diameter (mm)</td>
                      <td class="symbol">Do</td>
                      <td>{{ item.product?.materialAndDimensions?.outsideDia?.value_mm }}</td>
                      <td>{{ '-' }}</td>
                      <td>{{ '+' }}{{ item.product?.materialAndDimensions?.outsideDia?.tolerance_mm }}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <!-- Inside Diameter -->
                    <tr *ngIf="item.product?.materialAndDimensions?.insideDia">
                      <td class="sr-no">4</td>
                      <td class="parameter">Inside Diameter (mm)</td>
                      <td class="symbol">Di</td>
                      <td>{{ item.product?.materialAndDimensions?.insideDia?.value_mm }}</td>
                      <td>{{ '-' }}</td>
                      <td>{{ '+' }}{{ item.product?.materialAndDimensions?.insideDia?.tolerance_mm }}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <!-- Total Coils -->
                    <tr *ngIf="item.product?.materialAndDimensions?.totalCoils">
                      <td class="sr-no">5</td>
                      <td class="parameter">Total Coil (nos)</td>
                      <td class="symbol">N</td>
                      <td>{{ item.product?.materialAndDimensions?.totalCoils }}</td>
                      <td>{{ '-' }}</td>
                      <td>{{ '-' }}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <!-- Free Length -->
                    <tr *ngIf="item.product?.materialAndDimensions?.freeLength">
                      <td class="sr-no">6</td>
                      <td class="parameter">Free Length</td>
                      <td class="symbol">L0</td>
                      <td>{{ item.product?.materialAndDimensions?.freeLength?.value_mm }}</td>
                      <td>{{ '-' }}</td>
                      <td>{{ '+' }}{{ item.product?.materialAndDimensions?.freeLength?.tolerance_mm }}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <!-- Spring Rate -->
                    <tr *ngIf="item.product?.loadsRatesDeflection?.springRate">
                      <td class="sr-no">7</td>
                      <td class="parameter">Spring Rate (N/mm)</td>
                      <td class="symbol">K</td>
                      <td>{{ item.product?.loadsRatesDeflection?.springRate?.value_N_per_mm }}</td>
                      <td>{{ '-' }}</td>
                      <td>{{ '+' }}{{ item.product?.loadsRatesDeflection?.springRate?.tolerance_N_per_mm }}</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <!-- Additional rows for observations -->
                    <tr>
                      <td class="sr-no">8</td>
                      <td class="parameter">Grinding %</td>
                      <td class="symbol"></td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td class="sr-no">9</td>
                      <td class="parameter">Burr</td>
                      <td class="symbol"></td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td class="sr-no">10</td>
                      <td class="parameter">Surface</td>
                      <td class="symbol"></td>
                      <td>-</td>
                      <td>-</td>
                      <td>-</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <tr>
                      <td class="sr-no">11</td>
                      <td class="parameter">Part Net Weight</td>
                      <td class="symbol"></td>
                      <td>{{ item.product?.general?.partWeightNet || '-' }}</td>
                      <td>-</td>
                      <td>-</td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>

                    <!-- Remarks Row -->
                    <tr class="remarks-row">
                      <td colspan="10">
                        <strong>Remark:</strong> {{ item.product?.loadsRatesDeflection?.remark || 'All specifications are as per drawing' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <!-- Signature Section -->
              <div class="signature-section">
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-label">Prepared By</div>
                </div>
                <div class="signature-block">
                  <div class="signature-line"></div>
                  <div class="signature-label">Check By</div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn-secondary" (click)="closePDIReport()">Close</button>
            <button class="btn-print" (click)="printReport()">🖨️ Print Report</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pdi-report-container {
      .btn-generate-pdi {
        background: linear-gradient(135deg, #0b5ed7 0%, #084298 100%);
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
          box-shadow: 0 4px 12px rgba(11, 94, 215, 0.3);
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

    .modal-content.pdi-modal {
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
      width: 95%;
      max-width: 1200px;
      max-height: 90vh;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 2px solid #0b5ed7;
        background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);

        h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #08306b;
        }

        .header-actions {
          display: flex;
          gap: 12px;

          .btn-print {
            background: #0b5ed7;
            color: white;
            border: none;
            padding: 8px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
            font-size: 13px;

            &:hover {
              background: #084298;
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
          background: #0b5ed7;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;

          &:hover {
            background: #084298;
          }
        }
      }
    }

    .report-container {
      font-family: 'Arial', sans-serif;
      background: white;
      padding: 20px;

      .report-header {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        border-bottom: 3px solid #0b5ed7;
        padding-bottom: 12px;

        .logo-section {
          margin-right: 40px;

          .symag-logo {
            font-size: 18px;
            font-weight: 800;
            color: #08306b;
            background: #e7f1ff;
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
            color: #08306b;
            text-align: center;
            letter-spacing: 0.5px;
          }
        }
      }

      .product-title {
        text-align: center;
        font-size: 16px;
        font-weight: 700;
        color: #08306b;
        margin: 16px 0;
        padding: 8px;
        border-bottom: 2px solid #0b5ed7;
      }

      .header-info {
        margin: 16px 0;
        border: 1px solid #dee2e6;
        background: #f8f9fa;

        .info-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-bottom: 1px solid #dee2e6;

          &:last-child {
            border-bottom: none;
          }

          .info-item {
            display: grid;
            grid-template-columns: 150px 1fr;
            border-right: 1px solid #dee2e6;
            padding: 8px 12px;

            &:last-child {
              border-right: none;
            }

            label {
              font-weight: 700;
              color: #08306b;
              font-size: 12px;
            }

            .value {
              color: #000;
              font-weight: 600;
              font-size: 12px;
              margin-left: 12px;
            }
          }
        }
      }

      .specifications-section {
        margin: 20px 0;

        h3 {
          margin: 0 0 8px 0;
          font-size: 14px;
          font-weight: 700;
          color: #08306b;
        }

        .spec-table {
          width: 100%;
          border-collapse: collapse;
          border: 1px solid #000;
          font-size: 11px;

          thead {
            background: #f0f0f0;

            tr {
              border-bottom: 1px solid #000;

              th {
                border-right: 1px solid #000;
                padding: 6px 4px;
                text-align: center;
                font-weight: 700;
                color: #000;

                &:last-child {
                  border-right: none;
                }

                &.sr-no {
                  width: 40px;
                }

                &.symbol {
                  width: 50px;
                }

                &.specification-header {
                  width: 150px;
                }

                &.observed-header {
                  width: 200px;
                }
              }
            }
          }

          tbody {
            tr {
              border-bottom: 1px solid #000;

              &.remarks-row {
                td {
                  padding: 8px;
                  font-weight: 600;
                }
              }

              td {
                border-right: 1px solid #000;
                padding: 4px 6px;
                text-align: center;
                color: #000;

                &:last-child {
                  border-right: none;
                }

                &.sr-no {
                  background: #f9f9f9;
                  font-weight: 700;
                  width: 40px;
                }

                &.parameter {
                  text-align: left;
                  padding-left: 8px;
                  font-weight: 600;
                }

                &.symbol {
                  font-weight: 600;
                  width: 50px;
                }
              }
            }
          }
        }
      }

      .signature-section {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 80px;
        margin-top: 40px;
        padding-top: 20px;

        .signature-block {
          display: flex;
          flex-direction: column;
          align-items: center;

          .signature-line {
            width: 150px;
            height: 1px;
            background: #000;
            margin-bottom: 8px;
          }

          .signature-label {
            font-size: 12px;
            font-weight: 700;
            color: #000;
          }
        }
      }
    }

    @media print {
      .modal-overlay {
        background: white;
      }

      .modal-content.pdi-modal {
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
        padding: 0;

        .spec-table {
          page-break-inside: avoid;
        }
      }

      .btn-generate-pdi,
      .btn-print,
      .close-btn {
        display: none;
      }
    }

    @media (max-width: 900px) {
      .modal-content.pdi-modal {
        max-width: 100%;
        max-height: 95vh;
      }

      .report-container {
        padding: 12px;

        .report-header {
          flex-direction: column;
          gap: 12px;

          .logo-section {
            margin-right: 0;
          }
        }

        .header-info .info-row {
          grid-template-columns: 1fr;

          .info-item {
            grid-template-columns: 100px 1fr;
            border-right: none;
            border-bottom: 1px solid #dee2e6;

            &:last-child {
              border-bottom: none;
            }
          }
        }
      }
    }
  `]
})
export class PDIReportComponent {
  @Input() item: any;
  showPDIReport = false;

  openPDIReport(): void {
    this.showPDIReport = true;
  }

  closePDIReport(): void {
    this.showPDIReport = false;
  }

  printReport(): void {
    const printContent = document.getElementById('pdi-report-print');
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
}
