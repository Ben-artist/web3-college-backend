import { CommonEntity } from 'src/common/entities/common.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Course } from './course.entity';
import { UserChapterProgress } from './user-chapter-progress.entity';
/**
 * 章节实体 - 单个课程章节
