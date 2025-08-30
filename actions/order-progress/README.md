# Order Progress Modular Architecture

Arsitektur modular untuk sistem Order Progress yang mengimplementasikan prinsip SOLID dan design patterns untuk memudahkan maintenance dan pengembangan.

## 📁 Struktur File

```
actions/order-progress/
├── README.md                 # Dokumentasi arsitektur
├── types.ts                  # Type definitions dan interfaces
├── base-service.ts          # Logika umum dan utility functions
├── warehouse-service.ts     # Service untuk warehouse progress
├── shipping-service.ts      # Service untuk shipping progress
├── applied-service.ts       # Service untuk applied progress
├── result-service.ts        # Service untuk result progress
├── service-manager.ts       # Facade pattern untuk koordinasi service
├── index-new.ts            # API baru dengan backward compatibility
└── index.ts                # API lama (akan diganti)
```

## 🏗️ Arsitektur

### 1. **Base Service Layer** (`base-service.ts`)
Berisi logika umum yang digunakan oleh semua service:
- Validasi order
- Update status order
- Revalidasi cache
- Utility functions

### 2. **Individual Service Layer**
Setiap tahapan memiliki service terpisah:
- `WarehouseProgressService` - Mengelola warehouse progress
- `ShippingProgressService` - Mengelola shipping progress
- `AppliedProgressService` - Mengelola applied progress
- `ResultProgressService` - Mengelola result progress

### 3. **Service Manager Layer** (`service-manager.ts`)
Implementasi Facade Pattern yang:
- Mengkoordinasikan semua service
- Menyediakan API terpusat
- Mengelola dependencies
- Menyediakan operasi bulk

### 4. **API Layer** (`index-new.ts`)
Menyediakan:
- Backward compatibility dengan API lama
- Enhanced functions dengan fitur baru
- Type-safe exports

## 🎯 Implementasi Prinsip SOLID

### **S - Single Responsibility Principle**
- Setiap service hanya menangani satu tahapan progress
- Base service hanya menangani logika umum
- Service manager hanya mengkoordinasikan service

### **O - Open/Closed Principle**
- Mudah menambah tahapan baru tanpa mengubah kode existing
- Service baru tinggal implement `BaseProgressService`
- Extensible melalui inheritance dan composition

### **L - Liskov Substitution Principle**
- Semua service mengimplementasikan `BaseProgressService`
- Service dapat diganti tanpa mempengaruhi client code
- Polymorphism dalam service manager

### **I - Interface Segregation Principle**
- Interface yang spesifik untuk setiap kebutuhan
- Client tidak bergantung pada interface yang tidak digunakan
- Separation of concerns yang jelas

### **D - Dependency Inversion Principle**
- Service bergantung pada abstraksi (`BaseProgressService`)
- Dependency injection melalui constructor
- Loose coupling antar komponen

## 🔧 Penggunaan

### **Basic Usage**

```typescript
import { orderProgressManager } from './service-manager';

// Create progress
const result = await orderProgressManager.createProgress({
  order_id: 'order-123',
  stage: 'warehouse',
  data: { status: true }
});

// Get progress summary
const summary = await orderProgressManager.getProgressSummary('order-123');
```

### **Individual Service Usage**

```typescript
import { warehouseService } from './service-manager';

// Direct service access
const warehouseProgress = await warehouseService.create({
  order_id: 'order-123',
  stage: 'warehouse',
  data: { status: true }
});

// Check completion
const isCompleted = await warehouseService.isCompleted('order-123');
```

### **Legacy API (Backward Compatibility)**

```typescript
import { createOrderProgress, getProgressStagesStatus } from './index-new';

// API lama tetap bekerja
const result = await createOrderProgress({
  order_id: 'order-123',
  stage: 'warehouse',
  data: { status: true }
});

const status = await getProgressStagesStatus('order-123');
```

## 📊 Service Capabilities

### **Warehouse Service**
- ✅ Create/Update/Get/Delete warehouse progress
- ✅ Validasi status boolean
- ✅ Check completion status
- ✅ Business rules validation

### **Shipping Service**
- ✅ Create/Update/Get/Delete shipping progress
- ✅ Validasi tanggal shipping dan received
- ✅ Prerequisite validation (warehouse completed)
- ✅ Delivery status tracking
- ✅ Shipping duration calculation

### **Applied Service**
- ✅ Create/Update/Get/Delete applied progress
- ✅ Validasi area estimasi dan aktual
- ✅ Prerequisite validation (shipping completed)
- ✅ Area variance calculation
- ✅ Application efficiency metrics

### **Result Service**
- ✅ Create/Update/Get/Delete result progress
- ✅ Validasi yield status dan amount
- ✅ Prerequisite validation (applied completed)
- ✅ Yield per area calculation
- ✅ Result analysis dan ROI metrics

## 🚀 Enhanced Features

### **Progress Summary**
```typescript
const summary = await orderProgressManager.getProgressSummary('order-123');
// Returns:
// {
//   orderId: 'order-123',
//   completedStages: ['warehouse', 'shipping'],
//   currentStage: 'applied',
//   nextStage: 'result',
//   overallProgress: 50,
//   isCompleted: false
// }
```

### **Prerequisite Validation**
```typescript
const canProceed = await orderProgressManager.validatePrerequisites('order-123', 'shipping');
```

### **Bulk Operations**
```typescript
const bulkSummary = await orderProgressManager.getBulkProgressSummary([
  'order-123', 'order-456', 'order-789'
]);
```

### **Next Available Stage**
```typescript
const nextStage = await orderProgressManager.getNextAvailableStage('order-123');
```

## 🔍 Error Handling

Setiap service memiliki error handling yang konsisten:

```typescript
{
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}
```

### **Error Types**
- **Validation Errors**: Input data tidak valid
- **Business Rule Errors**: Melanggar aturan bisnis
- **Prerequisite Errors**: Tahapan sebelumnya belum selesai
- **Database Errors**: Error koneksi atau query database

## 🧪 Testing Strategy

### **Unit Tests**
- Test setiap service secara terpisah
- Mock dependencies untuk isolation
- Test business rules dan validasi

### **Integration Tests**
- Test service manager coordination
- Test database operations
- Test API backward compatibility

### **E2E Tests**
- Test complete workflow
- Test UI integration
- Test error scenarios

## 📈 Performance Considerations

### **Database Optimization**
- Efficient queries dengan proper indexing
- Batch operations untuk bulk updates
- Connection pooling

### **Caching Strategy**
- Next.js revalidatePath untuk cache invalidation
- Service-level caching untuk frequently accessed data
- Optimistic updates untuk better UX

### **Memory Management**
- Singleton pattern untuk service instances
- Proper cleanup dalam async operations
- Avoid memory leaks dalam event handlers

## 🔧 Migration Guide

### **From Legacy to Modular**

1. **Phase 1**: Deploy modular architecture alongside legacy
2. **Phase 2**: Update components to use new API
3. **Phase 3**: Remove legacy code

### **Breaking Changes**
Tidak ada breaking changes - semua API lama tetap kompatibel.

### **New Features**
- Enhanced progress summary
- Prerequisite validation
- Bulk operations
- Better error handling
- Type safety improvements

## 🛠️ Development Guidelines

### **Adding New Stage**

1. Create new service file (`new-stage-service.ts`)
2. Implement `BaseProgressService` interface
3. Add to service manager
4. Update types and schemas
5. Add tests

### **Extending Existing Service**

1. Add new methods to service class
2. Update interface if needed
3. Maintain backward compatibility
4. Add comprehensive tests

### **Code Style**
- TypeScript strict mode
- Comprehensive JSDoc comments
- Consistent error handling
- Proper type definitions

## 📚 Dependencies

- `@prisma/client` - Database ORM
- `zod` - Schema validation
- `next/cache` - Cache revalidation

## 🤝 Contributing

1. Follow SOLID principles
2. Write comprehensive tests
3. Update documentation
4. Maintain backward compatibility
5. Use TypeScript strict mode

## 📄 License

Internal project - follow company guidelines.

---

**Last Updated**: January 2024  
**Version**: 2.0.0  
**Maintainer**: Development Team