import { CommonEntity } from 'src/common/entities/common.entity';
import { COURSE_DIFFICULTY, COURSE_STATUS } from 'src/config/constant';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { NFTCertificate } from '../../certificate/entities/nft-certificate.entity';
import { User } from '../../user/entities/user.entity';
import { Chapter } from './chapter.entity';

/**
 * 课程实体 - 课程系列/集合
