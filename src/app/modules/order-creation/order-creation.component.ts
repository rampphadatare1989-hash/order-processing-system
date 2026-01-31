import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { OrderService } from '../../services/order.service';
import { SpringPartOrder, Order } from '../../models/spring-part.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-creation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-creation.component.html',
  styleUrls: ['./order-creation.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('in', style({
        opacity: 1
      })),
      transition(':enter', [
        style({
          opacity: 0
        }),
        animate('300ms ease-in')
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({
          opacity: 0
        }))
      ])
    ])
  ]
})
export class OrderCreationComponent implements OnInit {
  activeTab: 'CS' | 'CCS' | 'ES' | 'TS' | 'DTS' | 'WF' | 'PP' = 'CS';
  
  productTypes = ['CS', 'CCS', 'ES', 'TS', 'DTS', 'WF', 'PP'];
  
  // Current order form
  currentOrder: SpringPartOrder = {
    productType: 'CS',
    general: {
      symagPartNo: ''
    },
    materialAndDimensions: {
      wireDia: { value_mm: 0, tolerance_mm: 0 },
      outsideDia: { value_mm: 0, tolerance_mm: 0 },
      freeLength: { value_mm: 0, tolerance_mm: 0 }
    },
    loadsRatesDeflection: {
      springRate: { value_N_per_mm: 0, tolerance_N_per_mm: 0 }
    }
  };

  salesOrderId = '';
  quantity = 1;
  showSuccessMessage = false;
  successMessage = '';

  helixOptions = ['RHS', 'LHS'];
  surfaceTreatmentOptions = ['Zinc', 'Nickle', 'Powder Coating', 'EP'];

  constructor(
    private orderService: OrderService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  /**
   * Switch tab
   */
  switchTab(productType: string): void {
    this.activeTab = productType as any;
    this.currentOrder.productType = productType as any;
  }

  /**
   * Submit order
   */
  submitOrder(): void {
    if (!this.salesOrderId || this.quantity <= 0) {
      alert('Please fill in Sales Order ID and Quantity');
      return;
    }

    this.orderService.createOrder(
      this.salesOrderId,
      this.quantity,
      this.currentOrder
    ).subscribe(
      (order) => {
        this.showSuccessMessage = true;
        this.successMessage = `Order created successfully! Order ID: ${order.orderNumber}, Job Card ID: ${order.jobCardId}`;
        
        // Reset form
        setTimeout(() => {
          this.resetForm();
          this.showSuccessMessage = false;
        }, 3000);
      },
      (error) => {
        alert('Error creating order: ' + error);
      }
    );
  }

  /**
   * Reset form
   */
  resetForm(): void {
    this.currentOrder = {
      productType: 'CS',
      general: {
        symagPartNo: ''
      },
      materialAndDimensions: {
        wireDia: { value_mm: 0, tolerance_mm: 0 },
        outsideDia: { value_mm: 0, tolerance_mm: 0 },
        freeLength: { value_mm: 0, tolerance_mm: 0 }
      },
      loadsRatesDeflection: {
        springRate: { value_N_per_mm: 0, tolerance_N_per_mm: 0 }
      }
    };
    this.salesOrderId = '';
    this.quantity = 1;
  }

  /**
   * Get form fields for current product type
   */
  getFormFields(): any[] {
    // Basic fields for all product types
    const basicFields = [
      { key: 'general.symagPartNo', label: 'Symag Part #', type: 'text', required: true },
      { key: 'general.customerCode', label: 'Customer Code', type: 'text' },
      { key: 'general.customerPartNo', label: 'Customer Part #', type: 'text' },
      { key: 'general.partWeightNet', label: 'Part Weight (Net)', type: 'number' },
      { key: 'general.moq', label: 'MOQ', type: 'number' }
    ];

    const materialFields = [
      { key: 'materialAndDimensions.materialType', label: 'Material Type', type: 'text' },
      { key: 'materialAndDimensions.wireDia_value_mm', label: 'Wire Dia (mm)', type: 'number' },
      { key: 'materialAndDimensions.wireDia_tolerance_mm', label: 'Wire Dia ± (mm)', type: 'number' },
      { key: 'materialAndDimensions.outsideDia_value_mm', label: 'Outside Dia (mm)', type: 'number' },
      { key: 'materialAndDimensions.outsideDia_tolerance_mm', label: 'Outside Dia ± (mm)', type: 'number' },
      { key: 'materialAndDimensions.freeLength_value_mm', label: 'Free Length (mm)', type: 'number' },
      { key: 'materialAndDimensions.freeLength_tolerance_mm', label: 'Free Length ± (mm)', type: 'number' },
      { key: 'materialAndDimensions.totalCoils', label: 'Total Coils', type: 'number' },
      { key: 'materialAndDimensions.activeCoils', label: 'Active Coils', type: 'number' },
      { key: 'materialAndDimensions.pitch_mm', label: 'Pitch (mm)', type: 'number' }
    ];

    const loadsFields = [
      { key: 'loadsRatesDeflection.springRate_value_N_per_mm', label: 'Spring Rate (N/mm)', type: 'number' },
      { key: 'loadsRatesDeflection.springRate_tolerance_N_per_mm', label: 'Spring Rate ± (N/mm)', type: 'number' },
      { key: 'loadsRatesDeflection.load1_N', label: 'Load 1 (N)', type: 'number' },
      { key: 'loadsRatesDeflection.lengthAtLoad1_mm', label: 'Length at Load 1 (mm)', type: 'number' },
      { key: 'loadsRatesDeflection.deflectionAtLoad1_mm', label: 'Deflection at Load 1 (mm)', type: 'number' },
      { key: 'loadsRatesDeflection.operatingTemp_C', label: 'Operating Temp (°C)', type: 'number' },
      { key: 'loadsRatesDeflection.cycles', label: 'Cycles', type: 'number' }
    ];

    return [...basicFields, ...materialFields, ...loadsFields];
  }

  /**
   * Get field value from nested object
   */
  getFieldValue(key: string): any {
    const keys = key.split('.');
    let value: any = this.currentOrder;
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      }
    }
    
    return value;
  }

  /**
   * Set field value on nested object
   */
  setFieldValue(key: string, value: any): void {
    const keys = key.split('.');
    let obj: any = this.currentOrder;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!obj[keys[i]]) {
        obj[keys[i]] = {};
      }
      obj = obj[keys[i]];
    }
    
    obj[keys[keys.length - 1]] = value;
  }
}
