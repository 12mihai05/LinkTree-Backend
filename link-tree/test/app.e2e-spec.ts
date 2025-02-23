import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from '../src/auth/dto';
import { EditUserDto } from '../src/user/dto';
import {
  CreateLinkDto,
  EditLinkDto,
  UpdatePosDto,
} from 'src/link/dto';
import {
  CreateFolderDto,
  EditFolderDto,
} from 'src/folder/dto';
import * as fs from 'fs';
import * as path from 'path';

describe('Auth e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl(
      'http://localhost:3333',
    );
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'email@email.com',
      username: 'User1',
      password: 'pass123',
    };

    describe('Signup', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .expectStatus(400);
      });

      it('should signup successfully', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(dto)
          .expectStatus(201);
      });
    });

    describe('Signin', () => {
      it('should throw if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            password: dto.password,
          })
          .expectStatus(400);
      });

      it('should throw if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody({
            email: dto.email,
          })
          .expectStatus(400);
      });

      it('should throw if no body provided', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .expectStatus(400);
      });

      it('should signin successfully', () => {
        return pactum
          .spec()
          .post('/auth/signin')
          .withBody(dto)
          .expectStatus(200)
          .stores('userAt', 'access_token'); // Store the access token for further requests
      });
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it('should get current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200);
      });
    });

    describe('Edit User', () => {
      it('should edit user with profile image', async () => {
        const dto: EditUserDto = {
          firstName: 'Mihai',
          email: 'email@email.com',
        };

        const filePath = path.join(
          __dirname,
          'profile.jpg',
        ); // Ensure this file exists in your test directory
        const fileBuffer =
          fs.readFileSync(filePath);

        return pactum
          .spec()
          .patch('/users')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withMultiPartFormData(
            'firstName',
            dto.firstName,
          )
          .withMultiPartFormData(
            'email',
            dto.email,
          )
          .withMultiPartFormData({
            field: 'profileImage', // Field name as expected by your backend
            content: fileBuffer, // File content as Buffer
            filename: 'profile.jpg', // File name
            contentType: 'image/jpeg', // MIME type
          })
          .expectStatus(200)
          .expectBodyContains(dto.firstName)
          .expectBodyContains(dto.email);
      });
    });
  });

  describe('Folder', () => {
    describe('Get Folders', () => {
      it('should get all folders', () => {
        return pactum
          .spec()
          .get('/folders')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]); // Expecting empty list if no folders exist
      });
    });

    describe('Create Folder', () => {
      const dto: CreateFolderDto = {
        title: 'New Folder',
      };
      it('should create folder', () => {
        return pactum
          .spec()
          .post('/folders')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('folderId', 'id'); // Store the folderId for further use
      });
    });

    describe('Get Folder by Id', () => {
      it('should get folder by id', () => {
        return pactum
          .spec()
          .get('/folders/{id}')
          .withPathParams('id', '$S{folderId}') // Uses the stored folderId
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{folderId}');
      });
    });

    describe('Edit Folder by Id', () => {
      const dto: EditFolderDto = {
        title: 'Updated Folder Title',
      };
      it('should edit folder', () => {
        return pactum
          .spec()
          .patch('/folders/{id}')
          .withPathParams('id', '$S{folderId}') // Uses the stored folderId
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title);
      });
    });

    describe('Delete Folder by Id', () => {
      it('should delete folder', () => {
        return pactum
          .spec()
          .delete('/folders/{id}')
          .withPathParams('id', '$S{folderId}') // Uses the stored folderId
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204); // Expecting no content after deletion
      });

      it('should get empty folder list', () => {
        return pactum
          .spec()
          .get('/folders')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0); // After deletion, expect an empty array
      });
    });
  });

  describe('Link', () => {
    describe('Get Empty Links', () => {
      it('should get links', () => {
        return pactum
          .spec()
          .get('/links')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBody([]); // Check if it's empty
      });
    });

    describe('Create Link', () => {
      const folderId = parseInt(
        '$S{folderId}',
        10,
      );

      const dto: CreateLinkDto = {
        title: 'First Link',
        link: 'https://www.youtube.com/watch?v=GHTA143_b-s&t=9470s',
        folderId: folderId, // Reference the folderId stored earlier
      };
      it('should create link', () => {
        return pactum
          .spec()
          .post('/links')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(201)
          .stores('linkId', 'id'); // Stores the created link id for further tests
      });
    });

    describe('Get Link', () => {
      it('should get links', () => {
        return pactum
          .spec()
          .get('/links')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(1); // Expect one link after creation
      });
    });

    // describe('Get Links from Folder', () => {
    //   it('should get links from a folder', () => {
    //     const folderId = parseInt('$S{folderId}', 10); // Ensure this is parsed as an integer
    //     console.log('folderId:', folderId);

    //     return pactum
    //       .spec()
    //       .get('/links/folder/${folderId}') // Path for getting links from a folder
    //       .withPathParams('folderId', folderId) // Use the stored folderId
    //       .withHeaders({
    //         Authorization: 'Bearer $S{userAt}', // Authorization header
    //       })
    //       .expectStatus(200) // Expect the request to succeed
    //       .expectJsonLength(1); // Expect at least one link in the folder
    //   });
    // });

    describe('Get Link by Id', () => {
      it('should get link by id', () => {
        return pactum
          .spec()
          .get('/links/link/{id}')
          .withPathParams('id', '$S{linkId}') // Uses the stored linkId
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectBodyContains('$S{linkId}'); // Ensure the body contains the correct id
      });
    });

    describe('Edit Link by Id', () => {
      const dto: EditLinkDto = {
        title: 'Updated NestJs Course',
        description:
          'Updated description of the course.',
      };
      it('should edit link', () => {
        return pactum
          .spec()
          .patch('/links/{id}')
          .withPathParams('id', '$S{linkId}') // Uses the stored linkId
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .withBody(dto)
          .expectStatus(200)
          .expectBodyContains(dto.title)
          .expectBodyContains(dto.description);
      });
    });

    describe('Delete Link by Id', () => {
      it('should delete link', () => {
        return pactum
          .spec()
          .delete('/links/{id}')
          .withPathParams('id', '$S{linkId}') // Uses the stored linkId
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(204); // Expecting no content after deletion
      });

      it('should get empty link', () => {
        return pactum
          .spec()
          .get('/links')
          .withHeaders({
            Authorization: 'Bearer $S{userAt}',
          })
          .expectStatus(200)
          .expectJsonLength(0); // After deletion, expect an empty array
      });
    });
  });
});
