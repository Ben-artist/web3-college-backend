import { Injectable, NotFoundException } from '@nestjs/common';
import type { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import { Course } from '../course/entities/course.entity';
import { UserCourseProgress } from '../course/entities/user-course-progress.entity';
import type { RegisterUserDto } from './dto/register-user.dto';
import type { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

/**
