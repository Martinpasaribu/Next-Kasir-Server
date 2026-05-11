import { PartialType } from '@nestjs/swagger';
import { CreateAgentAssistantDto } from './create-agent-assistant.dto';

export class UpdateAgentAssistantDto extends PartialType(CreateAgentAssistantDto) {}
