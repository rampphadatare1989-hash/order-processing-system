import { Component, OnInit, ViewChild, TemplateRef, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../models/product.model';
import { ProductService } from '../../services/product.service';
import html2pdf from 'html2pdf.js';

@Component({
  selector: 'app-product-master',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './product-master.component.html',
  styleUrls: ['./product-master.component.scss']
})
export class ProductMasterComponent implements OnInit {
  @ViewChild('detailsContent') detailsContent!: ElementRef;
  
  products: Product[] = [];
  filteredProducts: Product[] = [];

  /** Product images (base64 or URLs) */
  public productImages: string[] = [];
  
  // Form and Modal properties
  productForm!: FormGroup;
  showProductModal = false;
  isEditMode = false;
  editingProductId: string | null = null;
  
  // Filter properties
  searchTerm: string = '';
  statusFilter: string = '';
  typeFilter: string = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // View mode
  selectedProduct: Product | null = null;
  showDetails = false;

  productTypes = ['CS', 'CCS', 'ES', 'TS', 'DTS', 'WF', 'PP'];
  productStatuses = ['ACTIVE', 'INACTIVE', 'ARCHIVED'];
  surfaceTreatments = ['Zinc', 'Nickle', 'Powder Coating', 'EP'];
  helixOptions = ['RHS', 'LHS'];

  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  /**
   * Initialize the product form
   */
  private initializeForm(): void {
    this.productForm = this.fb.group({
      productName: ['', [Validators.required, Validators.minLength(3)]],
      productType: ['CS', Validators.required],
      general: this.fb.group({
        symagPartNo: ['', Validators.required],
        partWeightNet: [''],
        customerCode: [''],
        customerPartNo: [''],
        customerPartNameNo: [''],
        moq: ['']
      }),
      materialAndDimensions: this.fb.group({
        materialType: [''],
        mtlSpec: [''],
        wireDia_value: [''],
        wireDia_tolerance: [''],
        outsideDia_value: [''],
        outsideDia_tolerance: [''],
        bigOutsideDia_value: [''],
        bigOutsideDia_tolerance: [''],
        smallOutsideDia_value: [''],
        smallOutsideDia_tolerance: [''],
        bigInsideDia_value: [''],
        bigInsideDia_tolerance: [''],
        smallInsideDia_value: [''],
        smallInsideDia_tolerance: [''],
        meanDia_value: [''],
        meanDia_tolerance: [''],
        insideDia_value: [''],
        insideDia_tolerance: [''],
        freeLength_value: [''],
        freeLength_tolerance: [''],
        freeLengthInsideHook_value: [''],
        freeLengthInsideHook_tolerance: [''],
        configuration: [''],
        totalCoils: [''],
        helix: [''],
        activeCoils: [''],
        endType: [''],
        hookType: [''],
        orientation: [''],
        gap_mm: [''],
        pitch_mm: [''],
        preset: [false],
        gradeSteel: [''],
        // helpers for works/heat treat (saved into nested objects)
        worksInside_holeDia: [''],
        worksOver_shaftDia: [''],
        heatTreat_degree_C: [''],
        heatTreat_time_min: ['']
      }),
      loadsRatesDeflection: this.fb.group({
        springRate_value: [''],
        springRate_tolerance: [''],
        lengthAtLoad1_mm: [''],
        load1_N: [''],
        deflectionAtLoad1_mm: [''],
        lengthAtLoad2_mm: [''],
        load2_N: [''],
        deflectionAtLoad2_mm: [''],
        solidHeight_value: [''],
        solidHeight_tolerance: [''],
        surfaceTreatment: ['Zinc'],
        remark: [''],
        prepBy: [''],
        date: [''],
        operatingTemp_C: [''],
        cycles: ['']
      }),
      status: ['ACTIVE', Validators.required]
    });
  }

  /**
   * Get form fields based on product type
   */
  getFormFieldsForType(type: string): any {
    const baseFields = {
      general: ['symagPartNo', 'partWeightNet', 'customerCode', 'customerPartNo', 'customerPartNameNo', 'moq'],
      common: ['materialType', 'mtlSpec', 'wireDia_value', 'wireDia_tolerance', 'outsideDia_value', 'outsideDia_tolerance', 'freeLength_value', 'freeLength_tolerance'],
      configuration: ['totalCoils', 'helix', 'activeCoils', 'endType', 'pitch_mm', 'preset'],
      loads: ['springRate_value', 'springRate_tolerance', 'lengthAtLoad1_mm', 'load1_N', 'deflectionAtLoad1_mm', 'lengthAtLoad2_mm', 'load2_N', 'deflectionAtLoad2_mm', 'solidHeight_value', 'solidHeight_tolerance'],
      operating: ['surfaceTreatment', 'operatingTemp_C', 'cycles', 'remark', 'prepBy', 'date']
    };

    const typeSpecificFields: { [key: string]: any } = {
      'CS': {
        ...baseFields,
        material: ['materialType', 'mtlSpec', 'gradeSteel', 'wireDia_value', 'wireDia_tolerance', 'outsideDia_value', 'outsideDia_tolerance', 'meanDia_value', 'meanDia_tolerance', 'freeLength_value', 'freeLength_tolerance'],
        config: ['totalCoils', 'activeCoils', 'helix', 'endType', 'pitch_mm', 'preset'],
        works: ['worksInside_holeDia', 'worksOver_shaftDia', 'heatTreat_degree_C', 'heatTreat_time_min']
      },
      'CCS': {
        ...baseFields,
        material: ['materialType', 'mtlSpec', 'gradeSteel', 'wireDia_value', 'wireDia_tolerance', 'bigOutsideDia_value', 'bigOutsideDia_tolerance', 'smallOutsideDia_value', 'smallOutsideDia_tolerance', 'freeLength_value', 'freeLength_tolerance'],
        config: ['totalCoils', 'activeCoils', 'helix', 'endType', 'pitch_mm', 'preset'],
        works: ['worksInside_holeDia', 'worksOver_shaftDia', 'heatTreat_degree_C', 'heatTreat_time_min']
      },
      'ES': {
        ...baseFields,
        material: ['materialType', 'mtlSpec', 'gradeSteel', 'wireDia_value', 'wireDia_tolerance', 'insideDia_value', 'insideDia_tolerance', 'freeLength_value', 'freeLength_tolerance', 'freeLengthInsideHook_value', 'freeLengthInsideHook_tolerance'],
        config: ['totalCoils', 'activeCoils', 'helix', 'hookType', 'pitch_mm', 'preset'],
        works: ['worksInside_holeDia', 'worksOver_shaftDia', 'heatTreat_degree_C', 'heatTreat_time_min']
      },
      'TS': {
        ...baseFields,
        material: ['materialType', 'mtlSpec', 'gradeSteel', 'wireDia_value', 'wireDia_tolerance', 'meanDia_value', 'meanDia_tolerance', 'freeLength_value', 'freeLength_tolerance'],
        config: ['totalCoils', 'activeCoils', 'helix', 'endType', 'pitch_mm', 'preset'],
        works: ['worksInside_holeDia', 'worksOver_shaftDia', 'heatTreat_degree_C', 'heatTreat_time_min']
      },
      'DTS': {
        ...baseFields,
        material: ['materialType', 'mtlSpec', 'gradeSteel', 'wireDia_value', 'wireDia_tolerance', 'meanDia_value', 'meanDia_tolerance', 'freeLength_value', 'freeLength_tolerance'],
        config: ['totalCoils', 'activeCoils', 'helix', 'endType', 'pitch_mm', 'preset'],
        works: ['worksInside_holeDia', 'worksOver_shaftDia', 'heatTreat_degree_C', 'heatTreat_time_min']
      },
      'WF': {
        ...baseFields,
        material: ['materialType', 'mtlSpec', 'wireDia_value', 'wireDia_tolerance', 'outsideDia_value', 'outsideDia_tolerance', 'insideDia_value', 'insideDia_tolerance', 'freeLength_value', 'freeLength_tolerance'],
        config: ['totalCoils', 'activeCoils', 'helix', 'endType', 'pitch_mm', 'preset'],
        works: ['worksInside_holeDia', 'worksOver_shaftDia', 'heatTreat_degree_C', 'heatTreat_time_min']
      },
      'PP': {
        ...baseFields,
        material: ['materialType', 'mtlSpec', 'wireDia_value', 'wireDia_tolerance', 'outsideDia_value', 'outsideDia_tolerance', 'insideDia_value', 'insideDia_tolerance', 'freeLength_value', 'freeLength_tolerance'],
        config: ['totalCoils', 'activeCoils', 'endType', 'preset'],
        works: ['heatTreat_degree_C', 'heatTreat_time_min']
      }
    };

    return typeSpecificFields[type] || baseFields;
  }

  /**
   * Get display label for a field
   */
  getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      // General
      symagPartNo: 'Part Number',
      partWeightNet: 'Part Weight (Net)',
      customerCode: 'Customer Code',
      customerPartNo: 'Customer Part #',
      customerPartNameNo: 'Customer Part Name #',
      moq: 'MOQ',
      // Material
      materialType: 'Material Type',
      mtlSpec: 'MTL Spec',
      gradeSteel: 'Grade',
      wireDia_value: 'Wire Dia (MM)',
      wireDia_tolerance: 'Wire Dia Tolerance',
      outsideDia_value: 'Outside Dia (MM)',
      outsideDia_tolerance: 'Outside Dia Tolerance',
      bigOutsideDia_value: 'Big Outside Dia (MM)',
      bigOutsideDia_tolerance: 'Big Outside Dia Tolerance',
      smallOutsideDia_value: 'Small Outside Dia (MM)',
      smallOutsideDia_tolerance: 'Small Outside Dia Tolerance',
      meanDia_value: 'Mean Dia (MM)',
      meanDia_tolerance: 'Mean Dia Tolerance',
      insideDia_value: 'Inside Dia (MM)',
      insideDia_tolerance: 'Inside Dia Tolerance',
      bigInsideDia_value: 'Big Inside Dia (MM)',
      bigInsideDia_tolerance: 'Big Inside Dia Tolerance',
      smallInsideDia_value: 'Small Inside Dia (MM)',
      smallInsideDia_tolerance: 'Small Inside Dia Tolerance',
      freeLength_value: 'Free Length (MM)',
      freeLength_tolerance: 'Free Length Tolerance',
      freeLengthInsideHook_value: 'Free Length Inside Hook (MM)',
      freeLengthInsideHook_tolerance: 'Free Length Inside Hook Tolerance',
      // Configuration
      totalCoils: 'Total Coils',
      helix: 'Helix',
      activeCoils: 'Active Coils',
      endType: 'End Type',
      hookType: 'Hook Type',
      pitch_mm: 'Pitch (MM)',
      preset: 'Preset',
      // Loads
      springRate_value: 'Spring Rate (N/MM)',
      springRate_tolerance: 'Spring Rate Tolerance',
      lengthAtLoad1_mm: 'Length at Load 1 (MM)',
      load1_N: 'Load 1 (N)',
      deflectionAtLoad1_mm: 'Deflection at Load 1 (MM)',
      lengthAtLoad2_mm: 'Length at Load 2 (MM)',
      load2_N: 'Load 2 (N)',
      deflectionAtLoad2_mm: 'Deflection at Load 2 (MM)',
      solidHeight_value: 'Solid Height (MM)',
      solidHeight_tolerance: 'Solid Height Tolerance',
      // Works & Heat
      worksInside_holeDia: 'Works Inside - Hole Dia',
      worksOver_shaftDia: 'Works Over - Shaft Dia',
      heatTreat_degree_C: 'Heat Treat (°C)',
      heatTreat_time_min: 'Heat Treat Time (Min)',
      // Operating
      surfaceTreatment: 'Surface Treatment',
      operatingTemp_C: 'Operating Temp (°C)',
      cycles: 'Cycles',
      remark: 'Remark',
      prepBy: 'Prep By',
      date: 'Date'
    };
    return labels[fieldName] || fieldName;
  }

  /**
   * Get full name for product type
   */
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

  /**
   * Handle product type change to update form visibility
   */
  onProductTypeChange(): void {
    // Trigger change detection
    this.productForm.updateValueAndValidity();
  }

  /**
   * Load products from service
   */
  private loadProducts(): void {
    this.productService.getProducts().subscribe(
      (products) => {
        this.products = products;
        // Ensure filters are applied and all records display
        this.applyFilters();
        // Trigger change detection to update the template
        this.cdr.markForCheck();
      },
      (error) => {
        console.error('Error loading products:', error);
        this.products = [];
        this.filteredProducts = [];
        this.cdr.markForCheck();
        alert('Failed to load products');
      }
    );
  }

  /**
   * Apply filters to products
   */
  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = 
        product.productName.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        product.general.symagPartNo.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesStatus = !this.statusFilter || product.status === this.statusFilter;
      const matchesType = !this.typeFilter || product.productType === this.typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });

    this.totalPages = Math.ceil(this.filteredProducts.length / this.pageSize);
    this.currentPage = 1;
  }

  /**
   * Get paginated products
   */
  getPaginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredProducts.slice(start, end);
  }

  /**
   * Next page
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  /**
   * Previous page
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  /**
   * Open product form modal for creating new product
   */
  openCreateModal(): void {
    this.isEditMode = false;
    this.editingProductId = null;
    this.productForm.reset({ status: 'ACTIVE' });
    this.productImages = [];
    this.showProductModal = true;
  }

  /**
   * Open product form modal for editing
   */
  openEditModal(product: Product): void {
    this.isEditMode = true;
    this.editingProductId = product.id || null;
    
    // Flatten the form data for easier binding
    this.productForm.patchValue({
      productName: product.productName,
      productType: product.productType,
      general: product.general,
      status: product.status,
      materialAndDimensions: {
        materialType: product.materialAndDimensions.materialType,
        mtlSpec: product.materialAndDimensions.mtlSpec,
        wireDia_value: product.materialAndDimensions.wireDia?.value_mm,
        wireDia_tolerance: product.materialAndDimensions.wireDia?.tolerance_mm,
        outsideDia_value: product.materialAndDimensions.outsideDia?.value_mm,
        outsideDia_tolerance: product.materialAndDimensions.outsideDia?.tolerance_mm,
        bigOutsideDia_value: product.materialAndDimensions.bigOutsideDia?.value_mm,
        bigOutsideDia_tolerance: product.materialAndDimensions.bigOutsideDia?.tolerance_mm,
        smallOutsideDia_value: product.materialAndDimensions.smallOutsideDia?.value_mm,
        smallOutsideDia_tolerance: product.materialAndDimensions.smallOutsideDia?.tolerance_mm,
        bigInsideDia_value: product.materialAndDimensions.bigInsideDia?.value_mm,
        bigInsideDia_tolerance: product.materialAndDimensions.bigInsideDia?.tolerance_mm,
        smallInsideDia_value: product.materialAndDimensions.smallInsideDia?.value_mm,
        smallInsideDia_tolerance: product.materialAndDimensions.smallInsideDia?.tolerance_mm,
        meanDia_value: product.materialAndDimensions.meanDia?.value_mm,
        meanDia_tolerance: product.materialAndDimensions.meanDia?.tolerance_mm,
        insideDia_value: product.materialAndDimensions.insideDia?.value_mm,
        insideDia_tolerance: product.materialAndDimensions.insideDia?.tolerance_mm,
        freeLength_value: product.materialAndDimensions.freeLength?.value_mm,
        freeLength_tolerance: product.materialAndDimensions.freeLength?.tolerance_mm,
        configuration: product.materialAndDimensions.configuration,
        totalCoils: product.materialAndDimensions.totalCoils,
        helix: product.materialAndDimensions.helix,
        activeCoils: product.materialAndDimensions.activeCoils,
        endType: product.materialAndDimensions.endType,
        hookType: product.materialAndDimensions['hookType'],
        orientation: product.materialAndDimensions['orientation'],
        gap_mm: product.materialAndDimensions['gap_mm'],
        pitch_mm: product.materialAndDimensions.pitch_mm,
        preset: product.materialAndDimensions.preset,
        worksInside_holeDia: product.materialAndDimensions.worksInside?.holeDia_mm,
        worksOver_shaftDia: product.materialAndDimensions.worksOver?.shaftDia_mm,
        heatTreat_degree_C: product.materialAndDimensions.heatTreat?.degree_C,
        heatTreat_time_min: product.materialAndDimensions.heatTreat?.time_min
      },
      loadsRatesDeflection: {
        springRate_value: product.loadsRatesDeflection.springRate?.value_N_per_mm,
        springRate_tolerance: product.loadsRatesDeflection.springRate?.tolerance_N_per_mm,
        lengthAtLoad1_mm: product.loadsRatesDeflection.lengthAtLoad1_mm,
        load1_N: product.loadsRatesDeflection.load1_N,
        deflectionAtLoad1_mm: product.loadsRatesDeflection.deflectionAtLoad1_mm,
        lengthAtLoad2_mm: product.loadsRatesDeflection.lengthAtLoad2_mm,
        load2_N: product.loadsRatesDeflection.load2_N,
        deflectionAtLoad2_mm: product.loadsRatesDeflection.deflectionAtLoad2_mm,
        solidHeight_value: product.loadsRatesDeflection.solidHeight?.value_mm,
        solidHeight_tolerance: product.loadsRatesDeflection.solidHeight?.tolerance_mm,
        surfaceTreatment: product.loadsRatesDeflection.surfaceTreatment,
        operatingTemp_C: product.loadsRatesDeflection.operatingTemp_C,
        cycles: product.loadsRatesDeflection.cycles,
        date: product.loadsRatesDeflection.date,
        remark: product.loadsRatesDeflection.remark,
        prepBy: product.loadsRatesDeflection.prepBy
      }
    });
    
    this.productImages = product.images ? [...product.images] : [];
    this.showProductModal = true;
  }

  /**
   * Close product modal
   */
  closeModal(): void {
    this.showProductModal = false;
    this.isEditMode = false;
    this.editingProductId = null;
    this.productForm.reset({ status: 'ACTIVE' });
    this.productImages = [];
  }
  /**
   * Handle image file selection (max 6 images)
   */
  onImageSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const files = Array.from(input.files);
    const maxSelectable = 6 - this.productImages.length;
    const filesToAdd = files.slice(0, maxSelectable);
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (this.productImages.length < 6) {
          this.productImages.push(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset input value so same file can be reselected if removed
    input.value = '';
  }

  /**
   * Remove image by index
   */
  removeImage(index: number): void {
    this.productImages.splice(index, 1);
  }

  /**
   * Remove undefined values from object recursively
   */
  private cleanObject(obj: any): any {
    if (obj === null || obj === undefined) return null;
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanObject(item)).filter(item => item !== null);
    }
    
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          if (value !== undefined && value !== null) {
            if (typeof value === 'object') {
              const cleanedValue = this.cleanObject(value);
              if (Object.keys(cleanedValue || {}).length > 0) {
                cleaned[key] = cleanedValue;
              }
            } else {
              cleaned[key] = value;
            }
          }
        }
      }
      return cleaned;
    }
    
    return obj;
  }

  /**
   * Save product (create or update)
   */
  saveProduct(): void {
    if (!this.productForm.valid) {
      alert('Please fill in all required fields');
      return;
    }

    const formValue = this.productForm.value;

    // Reconstruct the product object with proper nested structure, including CS-specific nested fields
    const material = formValue.materialAndDimensions || {};
    const loads = formValue.loadsRatesDeflection || {};

    const productData: Product = {
      productName: formValue.productName,
      productType: formValue.productType,
      general: formValue.general,
      status: formValue.status,
      images: this.productImages,
      materialAndDimensions: {
        materialType: material.materialType,
        mtlSpec: material.mtlSpec,
        wireDia: material.wireDia_value ? {
          value_mm: parseFloat(material.wireDia_value),
          tolerance_mm: parseFloat(material.wireDia_tolerance || 0)
        } : undefined,
        outsideDia: material.outsideDia_value ? {
          value_mm: parseFloat(material.outsideDia_value),
          tolerance_mm: parseFloat(material.outsideDia_tolerance || 0)
        } : undefined,
        meanDia: material.meanDia_value ? {
          value_mm: parseFloat(material.meanDia_value),
          tolerance_mm: parseFloat(material.meanDia_tolerance || 0)
        } : undefined,
        insideDia: material.insideDia_value ? {
          value_mm: parseFloat(material.insideDia_value),
          tolerance_mm: parseFloat(material.insideDia_tolerance || 0)
        } : undefined,
        freeLength: material.freeLength_value ? {
          value_mm: parseFloat(material.freeLength_value),
          tolerance_mm: parseFloat(material.freeLength_tolerance || 0)
        } : undefined,
        bigOutsideDia: material.bigOutsideDia_value ? {
          value_mm: parseFloat(material.bigOutsideDia_value),
          tolerance_mm: parseFloat(material.bigOutsideDia_tolerance || 0)
        } : undefined,
        smallOutsideDia: material.smallOutsideDia_value ? {
          value_mm: parseFloat(material.smallOutsideDia_value),
          tolerance_mm: parseFloat(material.smallOutsideDia_tolerance || 0)
        } : undefined,
        bigInsideDia: material.bigInsideDia_value ? {
          value_mm: parseFloat(material.bigInsideDia_value),
          tolerance_mm: parseFloat(material.bigInsideDia_tolerance || 0)
        } : undefined,
        smallInsideDia: material.smallInsideDia_value ? {
          value_mm: parseFloat(material.smallInsideDia_value),
          tolerance_mm: parseFloat(material.smallInsideDia_tolerance || 0)
        } : undefined,
        configuration: material.configuration,
        totalCoils: material.totalCoils,
        helix: material.helix,
        activeCoils: material.activeCoils,
        endType: material.endType,
        hookType: material.hookType,
        orientation: material.orientation,
        gap_mm: material.gap_mm,
        pitch_mm: material.pitch_mm,
        preset: material.preset,
        worksInside: material.worksInside_holeDia ? { holeDia_mm: parseFloat(material.worksInside_holeDia) } : undefined,
        worksOver: material.worksOver_shaftDia ? { shaftDia_mm: parseFloat(material.worksOver_shaftDia) } : undefined,
        heatTreat: (material.heatTreat_degree_C || material.heatTreat_time_min) ? {
          degree_C: material.heatTreat_degree_C ? parseFloat(material.heatTreat_degree_C) : undefined,
          time_min: material.heatTreat_time_min ? parseFloat(material.heatTreat_time_min) : undefined
        } : undefined
      },
      loadsRatesDeflection: {
        springRate: loads.springRate_value ? {
          value_N_per_mm: parseFloat(loads.springRate_value),
          tolerance_N_per_mm: parseFloat(loads.springRate_tolerance || 0)
        } : undefined,
        lengthAtLoad1_mm: loads.lengthAtLoad1_mm ? parseFloat(loads.lengthAtLoad1_mm) : undefined,
        load1_N: loads.load1_N ? parseFloat(loads.load1_N) : undefined,
        deflectionAtLoad1_mm: loads.deflectionAtLoad1_mm ? parseFloat(loads.deflectionAtLoad1_mm) : undefined,
        lengthAtLoad2_mm: loads.lengthAtLoad2_mm ? parseFloat(loads.lengthAtLoad2_mm) : undefined,
        load2_N: loads.load2_N ? parseFloat(loads.load2_N) : undefined,
        deflectionAtLoad2_mm: loads.deflectionAtLoad2_mm ? parseFloat(loads.deflectionAtLoad2_mm) : undefined,
        solidHeight: loads.solidHeight_value ? {
          value_mm: parseFloat(loads.solidHeight_value),
          tolerance_mm: parseFloat(loads.solidHeight_tolerance || 0)
        } : undefined,
        surfaceTreatment: loads.surfaceTreatment,
        operatingTemp_C: loads.operatingTemp_C ? parseFloat(loads.operatingTemp_C) : undefined,
        cycles: loads.cycles ? parseInt(loads.cycles, 10) : undefined,
        date: loads.date,
        remark: loads.remark,
        prepBy: loads.prepBy
      }
    };

    if (this.isEditMode && this.editingProductId) {
      const cleanedData = this.cleanObject(productData);
      this.productService.updateProduct(this.editingProductId, cleanedData).subscribe(
        () => {
          alert('Product updated successfully');
          this.closeModal();
          this.loadProducts();
        },
        (error) => {
          console.error('Error updating product:', error);
          alert('Failed to update product');
        }
      );
    } else {
      const cleanedData = this.cleanObject(productData);
      this.productService.createProduct(cleanedData).subscribe(
        () => {
          alert('Product created successfully');
          this.closeModal();
          this.loadProducts();
        },
        (error) => {
          console.error('Error creating product:', error);
          alert('Failed to create product');
        }
      );
    }
  }

  /**
   * Delete product
   */
  deleteProduct(product: Product): void {
    if (!product.id) return;

    if (confirm(`Are you sure you want to delete "${product.productName}"?`)) {
      this.productService.deleteProduct(product.id).subscribe(
        () => {
          alert('Product deleted successfully');
          this.loadProducts();
        },
        (error) => {
          console.error('Error deleting product:', error);
          alert('Failed to delete product');
        }
      );
    }
  }

  /**
   * View product details
   */
  viewDetails(product: Product): void {
    this.selectedProduct = product;
    this.showDetails = true;
  }

  /**
   * Close details view
   */
  closeDetails(): void {
    this.showDetails = false;
    this.selectedProduct = null;
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      ACTIVE: '#4CAF50',
      INACTIVE: '#FF9800',
      ARCHIVED: '#F44336'
    };
    return colors[status] || '#999999';
  }

  /**
   * Print product details to PDF
   * Tries to use `ngx-print-element` (if available) otherwise falls back to html2pdf
   */
  async printToPDF(): Promise<void> {
    if (!this.selectedProduct) return;

    const element = this.detailsContent?.nativeElement;
    if (!element) {
      console.error('Details content element not found');
      return;
    }

    // Try to dynamically use ngx-print-element if installed
    try {
      const mod: any = await import('ngx-print-element');

      // Common export patterns: a helper function or a service/class
      if (mod) {
        // If there's a simple helper function `printElement`
        if (typeof mod.printElement === 'function') {
          mod.printElement(element);
          return;
        }

        // If a class/service is exported with a `print` method
        const Exported = mod.PrintService || mod.PrintElement || mod.default;
        if (Exported) {
          try {
            const inst = new Exported();
            if (typeof inst.print === 'function') {
              inst.print(element);
              return;
            }
          } catch (e) {
            // ignore instantiation errors and fallback
          }
        }
      }
    } catch (e) {
      // module not found or other import error - fallback to html2pdf below
    }

    // Fallback to html2pdf.js (already installed) for PDF generation
    const opt = {
      margin: 10,
      filename: `${this.selectedProduct.productName}-details.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' }
    };

    try {
      html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF');
    }
  }
  
  // Magnify/minify image handlers for product images
  magnify(event: MouseEvent) {
      const img = event.target as HTMLImageElement;
      img.style.transform = 'scale(9)';
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
}

