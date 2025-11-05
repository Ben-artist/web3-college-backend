import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export class CommonEntity {

  // 软删除时间
  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt?: Date;
  
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
