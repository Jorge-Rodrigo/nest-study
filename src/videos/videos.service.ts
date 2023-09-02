import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { PrismaService } from '../prisma/prisma/prisma.service';
import { InvalidRelationError } from '../errors/invalid-relation.error';
import { VideoFileValidator } from './video-file-validator';

@Injectable()
export class VideosService {
  constructor(private prismaService: PrismaService) {}

  async create(createVideoDto: CreateVideoDto & { file: Express.Multer.File }) {
    const categoryExists =
      (await this.prismaService.category.count({
        where: {
          id: createVideoDto.category_id,
        },
      })) != 0;
    if (!categoryExists) {
      throw new InvalidRelationError('Category not found!');
    }

    return this.prismaService.video.create({
      data: {
        title: createVideoDto.title,
        description: createVideoDto.description,
        category_id: createVideoDto.category_id,
        file_path: createVideoDto.file.path,
      },
    });
  }

  findAll() {
    return this.prismaService.video.findMany({
      include: {
        category: true,
      },
    });
  }

  findOne(id: number) {
    return this.prismaService.video.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async update(
    id: number,
    updateVideoDto: UpdateVideoDto & { file: Express.Multer.File | undefined },
  ) {
    if (updateVideoDto.category_id) {
      const categoryExists =
        (await this.prismaService.category.count({
          where: {
            id: updateVideoDto.category_id,
          },
        })) != 0;
      if (!categoryExists) {
        throw new InvalidRelationError('Category not found!');
      }
    }
    if (updateVideoDto.file) {
      const videoFileValidator = new VideoFileValidator({
        maxSize: 1024 * 1024 * 100,
        mimetype: 'video/mp4',
      });

      if (!videoFileValidator.isValid(updateVideoDto.file)) {
        throw new BadRequestException(
          videoFileValidator.buildErrorMessage(updateVideoDto.file),
        );
      }
    }
    return this.prismaService.video.update({
      data: {
        title: updateVideoDto.title,
        description: updateVideoDto.description,
        category_id: updateVideoDto.category_id,
        file_path: updateVideoDto.file?.path,
      },
      where: {
        id,
      },
    });
  }

  remove(id: number) {
    return this.prismaService.video.delete({
      where: {
        id,
      },
    });
  }
}
