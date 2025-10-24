import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

interface AuthenticatedUser {
  id: string;
  email: string;
  walletAddress: string;
  username: string;
  avatarUrl: string;
}

/**
