import { CommonEntity } from 'src/common/entities/common.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Course } from '../../course/entities/course.entity';
import { User } from '../../user/entities/user.entity';

// nft 要与课程表关
@Entity('nft_certificates')
@Index(['userId']) // 用户查询优化
@Index(['courseId']) // 课程查询优化
export class NFTCertificate extends CommonEntity {
  @PrimaryGeneratedColumn()
  certificateId: number;

  // NFT Token ID
  @Column({ unique: true })
  tokenId: string;

  // NFT合约地址
  @Column()
  contractAddress: string;

  // 拥有者用户ID
  @Column()
  userId: number;

  // 钱包地址（冗余存储，方便直接查询） 
   @Column()
  walletAddress: string;

  // 关联课程ID
  @Column()
  courseId: number;

  // 完成日期
  @Column()
  completionDate: Date;

  // 数据IPFS链接
  @Column()
  metadata: string;

  // NFT预览链接
  @Column({ nullable: true })
  nftUrl: string;

  // 铸造交易哈希
  @Column()
  transactionHash: string;

  // 区块号
  @Column()
  blockNumber: number;

  // 关联用户
  @ManyToOne(
    () => User,
    (user) => user.certificates
  )
  @JoinColumn({ name: 'userId', referencedColumnName: 'id' })
  user: User;

  // 关联课程
  @ManyToOne(
    () => Course,
    (course) => course.certificates,
  )
  @JoinColumn({ name: 'courseId', referencedColumnName: 'courseId' })
  course: Course;
}
