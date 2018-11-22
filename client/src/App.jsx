import React, { Component } from 'react';
import request from 'request';

const baseUrl = 'http://localhost:3000/';
const signersEndpoint = 'api/org.example.mynetwork.Signer';
const signEndoint = 'api/org.example.mynetwork.Sign';

class App extends Component {
    constructor() {
        super();
        this.state = {
            error: '',
            signers: null,
            filesSigned: null,
        };

        this.handleChange = this.handleChange.bind(this);
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

    loadSignedFiles(signer) {
        const filter = `{"where": {"signer": "resource:org.example.mynetwork.Signer#${signer}"}}`;
        const escapedFilter = encodeURIComponent(filter);
        console.log(`${baseUrl + signEndoint}?filter=${escapedFilter}`);
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

    handleChange(event) {
        if (event.target.name === 'user_select') {
            this.loadSignedFiles(event.target.value);
        }
        event.preventDefault();
    }

    render() {
        const { signers, filesSigned, error } = this.state;
        let resultFilesSigned;
        if (error) {
            return `There was an error!${error}`;
        }
        if (signers === null) {
            return 'Loading...';
        }
        if (filesSigned !== null) {
            resultFilesSigned = filesSigned.map(
                file => <li key={file.file}>{file.file.match('resource:.*#(.*)')[1]}</li>,
            );
        }
        return (
            <div>
                Select signer
                <select name="user_select" onChange={this.handleChange}>
                    <option key="select">select</option>
                    {signers.map(signer => (
                        <option key={signer.username}>
                            {signer.username}
                        </option>
                    ))}
                </select>
                <ul>
                    {resultFilesSigned}
                </ul>
            </div>
        );
    }
}

export default App;
