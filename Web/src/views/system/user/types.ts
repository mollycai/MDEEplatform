import { DialogTypeEnum } from '@/enums/dataEnum';

export type DialogStatus = DialogTypeEnum.EDIT | DialogTypeEnum.CREATE;

export type RoleOptions = { roleId: number; roleName: string; status: '0' | '1' };
