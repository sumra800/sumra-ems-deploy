import { Controller, Post, Body, Get, UseGuards, Req, Param } from '@nestjs/common';
import { VotesService } from './votes.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Roles(UserRole.VOTER)
  @UseGuards(RolesGuard)
  @Post()
  castVote(@Req() req: any, @Body() castVoteDto: CastVoteDto) {
    return this.votesService.castVote(req.user, castVoteDto);
  }

  @Get('my-votes')
  findMyVotes(@Req() req: any) {
    return this.votesService.findMyVotes(req.user.id);
  }

  @Get('has-voted/:electionId')
  hasVoted(@Req() req: any, @Param('electionId') electionId: string) {
    return this.votesService.hasVoted(req.user.id, electionId);
  }
}
