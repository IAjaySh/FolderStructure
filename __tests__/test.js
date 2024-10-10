const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const fs = require('fs');
const path = require('path');
const app = require('../src/index');
const { prisma } = require('../db/config');
const { expect } = chai;

chai.use(chaiHttp);

describe('Folder Management API', () => {
    let prismaMock;

    beforeEach(() => {
        prismaMock = sinon.stub(prisma.prototype);
    });

    before(async () => {
        await prisma.folderStructure.deleteMany({});

        await prisma.folderStructure.create({
            data: {
                id: 1,
                structure: []
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('GET /api/create', () => {

        it('should return 400 if location is missing or invalid', (done) => {
            chai.request(app)
                .get('/api/create')
                .query({ id: 1 }) // Missing location query
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Invalid path provided.');
                    done();
                });
        });


        it('should create file and return 201', (done) => {
            // prismaMock.folderStructure.findUnique.resolves({ structure: [] });
            // prismaMock.folderStructure.update.resolves();
            // sinon.stub(fs, 'existsSync').returns(false);
            // sinon.stub(fs, 'writeFileSync');

            chai.request(app)
                .get('/api/create')
                .query({ id: 1, location: 'some/path/file.txt', fileContent: 'Hello, world!' })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('message', 'File or folder created successfully');
                    done();
                });
        });
    });

    describe('PUT /api/push', () => {
        it('should return 400 if id or location is missing', (done) => {
            chai.request(app)
                .put('/api/push')
                .query({ id: null, location: 'some/path' }) // Missing id
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(res.body).to.have.property('error', 'Invalid id or location provided.');
                    done();
                });
        });

        it('should return 404 if path does not exist', (done) => {
            sinon.stub(fs, 'existsSync').returns(false);

            chai.request(app)
                .put('/api/push')
                .query({ id: 1, location: 'nonexistent/path' })
                .end((err, res) => {
                    expect(res).to.have.status(404);
                    expect(res.body).to.have.property('error', 'Specified path does not exist.');
                    done();
                });
        });

        // it('should update folder structure and return 200', (done) => {
        //     // prismaMock.folderStructure.update.resolves();
        //     // sinon.stub(fs, 'existsSync').returns(true);
        //     // sinon.stub(fs, 'lstatSync').returns({ isDirectory: () => true });

        //     chai.request(app)
        //         .put('/api/push')
        //         .query({ id: 1, location: 'existing/path' })
        //         .end((err, res) => {
        //             expect(res).to.have.status(200);
        //             expect(res.body).to.have.property('message', 'Folder structure updated successfully');
        //             done();
        //         });
        // });

        it('should create folders and files from the structure', async (done) => {

            await prisma.folderStructure.deleteMany({});
            await prisma.folderStructure.create({
                data: {
                    id: 1,
                    structure: [
                        {
                            "name": "ap",
                            "type": "folder",
                            "childs": [
                                {
                                    "name": "notes",
                                    "type": "folder",
                                    "childs": [
                                        {
                                            "name": "javascript.txt",
                                            "type": "file",
                                            "content": "this is js notes file"
                                        }
                                    ]
                                }
                            ]
                        }
                    ]

                }
            });

            chai.request(app)
                .get('/api/create-structure')
                .query({ id: 1 })
                .end((err, res) => {
                    expect(res).to.have.status(201);
                    expect(res.body).to.have.property('message', 'Folders and files created successfully.');

                    // Check if the folders and files were created correctly
                    const thatisPath = __dirname + "../" + "controllers";
                    console.log("that is path -> ", thatisPath);
                    expect(fs.existsSync(path.join(thatisPath, 'drive', 'ap'))).to.be.true;
                    expect(fs.existsSync(path.join(thatisPath, 'drive', 'ap', 'notes'))).to.be.true;
                    expect(fs.existsSync(path.join(thatisPath, 'drive', 'ap', 'notes', 'ajay.js'))).to.be.true;
                    expect(fs.readFileSync(path.join(thatisPath, 'drive', 'ap', 'notes', 'ajay.js'), 'utf-8')).to.equal('god:"Ajay is my best creation"');
                    expect(fs.existsSync(path.join(thatisPath, 'drive', 'ap', 'notes', 'database.txt'))).to.be.true;
                    expect(fs.readFileSync(path.join(thatisPath, 'drive', 'ap', 'notes', 'database.txt'), 'utf-8')).to.equal('this content is for database file');

                    done();
                });
        });
    });
});
