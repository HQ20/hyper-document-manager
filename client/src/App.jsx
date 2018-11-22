import React, { Component } from 'react';
import request from 'request';

const baseUrl = 'http://localhost:3000/';
const signersEndpoint = 'api/org.example.mynetwork.Signer';
const fileEndpoint = 'api/org.example.mynetwork.File';
const signEndoint = 'api/org.example.mynetwork.Sign';

class App extends Component {
    constructor() {
        super();
        this.state = {
            error: '',
            signers: null,
            files: null,
            filesSigned: null,
            signNewFile: null,
            existingFileToSign: 'select',
            signNewFileUrl: '',
            userSelectSign: '',
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        request(baseUrl, (error) => {
            if (error) {
                this.setState({ error });
                return;
            }
            this.loadSigners();
        });
    }

    loadSigners() {
        request(baseUrl + signersEndpoint, (err, response) => {
            if (err) {
                return;
            }
            const signers = JSON.parse(response.body);
            this.setState({ signers });
        });
    }

    loadFiles() {
        request(baseUrl + fileEndpoint, (err, response) => {
            if (err) {
                return;
            }
            const files = JSON.parse(response.body);
            this.setState({ files });
        });
    }

    loadSignedFiles(signer) {
        const filter = `{"where": {"signer": "resource:org.example.mynetwork.Signer#${signer}"}}`;
        const escapedFilter = encodeURIComponent(filter);
        request(`${baseUrl + signEndoint}?filter=${escapedFilter}`, (err, response) => {
            if (err) {
                return;
            }
            const filesSigned = JSON.parse(response.body);
            this.setState({ filesSigned });
        });
    }

    // eslint-disable-next-line class-methods-use-this
    signFile(signer, fileUrl) {
        console.log('no', signer, fileUrl);
        request.post({
            url: baseUrl + signEndoint,
            form: {
                $class: 'org.example.mynetwork.Sign',
                file: `resource:org.example.mynetwork.File#${fileUrl}`,
                signer: `resource:org.example.mynetwork.Signer#${signer}`,
            },
        }, (err, httpResponse, body) => {
            if (httpResponse.statusCode === 200) {
                const jsonObject = JSON.parse(body);
                if (jsonObject.transactionId.length > 0) {
                    // eslint-disable-next-line no-undef
                    window.location.reload();
                }
            }
        });
    }

    // eslint-disable-next-line class-methods-use-this
    async uplaoadFile(signer, fileUrl) {
        await request.post({
            url: baseUrl + signEndoint,
            form: {
                $class: 'org.example.mynetwork.File',
                fileURL: fileUrl,
                signers: [
                    `resource:org.example.mynetwork.Signer#${signer}`,
                ],
            },
        });
    }

    async handleSubmit(event) {
        const { existingFileToSign, signNewFileUrl, userSelectSign } = this.state;
        let useFileUrl;
        if (event.target.name === 'sign_new_file') {
            await this.uplaoadFile(userSelectSign, useFileUrl);
            useFileUrl = signNewFileUrl;
        } else if (event.target.name === 'sign_existing_file') {
            useFileUrl = existingFileToSign;
        }
        this.signFile(userSelectSign, useFileUrl);
        event.preventDefault();
    }

    handleChange(event) {
        if (event.target.name === 'user_select_list') {
            this.loadSignedFiles(event.target.value);
        } else if (event.target.name === 'userSelectSign') {
            this.setState({ userSelectSign: event.target.value });
            this.loadFiles();
        } else if (event.target.name === 'action_type') {
            this.setState({ signNewFile: (event.target.value === 'new') });
        } else if (event.target.name === 'signNewFileUrl') {
            this.setState({ signNewFileUrl: event.target.value });
        } else if (event.target.name === 'existingFileToSign') {
            this.setState({ existingFileToSign: event.target.value });
        }
        event.preventDefault();
    }

    render() {
        const {
            signers,
            files,
            signNewFile,
            filesSigned,
            error,
            existingFileToSign,
            signNewFileUrl,
            userSelectSign,
        } = this.state;
        let resultFilesSigned;
        let existingFiles;
        if (error) {
            return `There was an error!${error}`;
        }
        if (signers === null) {
            return 'Loading...';
        }
        if (signNewFile === false) {
            existingFiles = files.map(file => (
                <option key={file.fileURL} value={file.fileURL}>
                    {file.fileURL}
                </option>
            ));
        }
        if (filesSigned !== null) {
            resultFilesSigned = filesSigned.map(
                file => <li key={file.file}>{file.file.match('resource:.*#(.*)')[1]}</li>,
            );
        }
        return (
            <div>
                <fieldset>
                    <legend>List signed files by user:</legend>
                    Select signer
                    <select name="user_select_list" onChange={this.handleChange}>
                        <option key="select">select</option>
                        {signers.map(signer => (
                            <option key={signer.username} value={signer.username}>
                                {signer.username}
                            </option>
                        ))}
                    </select>
                    <ul>
                        {resultFilesSigned}
                    </ul>
                </fieldset>
                <fieldset>
                    <legend>Sign a file:</legend>
                    Select signer
                    <select name="userSelectSign" value={userSelectSign} onChange={this.handleChange}>
                        <option key="select">select</option>
                        {signers.map(signer => (
                            <option key={signer.username}>
                                {signer.username}
                            </option>
                        ))}
                    </select>
                    <select hidden={(files === null)} type="text" name="action_type" onChange={this.handleChange}>
                        <option key="select" value="select">Select</option>
                        <option key="new" value="new">New</option>
                        <option key="existing" value="existing">Existing</option>
                    </select>
                    <form hidden={(signNewFile !== true)} name="sign_new_file" onSubmit={this.handleSubmit}>
                        <input
                            type="text"
                            name="signNewFileUrl"
                            value={signNewFileUrl}
                            onChange={this.handleChange}
                            placeholder="file url"
                        />
                        <input type="submit" value="Sign" />
                    </form>
                    <form hidden={(signNewFile !== false)} name="sign_existing_file" onSubmit={this.handleSubmit}>
                        <select name="existingFileToSign" value={existingFileToSign} onChange={this.handleChange}>
                            <option key="select" value="select">select</option>
                            {existingFiles}
                        </select>
                        <input type="submit" value="Sign" />
                    </form>
                </fieldset>
            </div>
        );
    }
}

export default App;
