class DataHandler {
    constructor() {
        this.apiEndpoint = 'write_data.php';
        this.pythonEndpoint = 'run_python.php';
    }

    async sendData(filename, data, replace = true) {
        try {
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    filename: filename,
                    content: data,
                    append: !replace
                })
            });
            return await response.json();
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    async runPython(pythonFile, data = {}) {
        try {
            const response = await fetch(this.pythonEndpoint, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    file: pythonFile,
                    data: data
                })
            });
            return await response.json();
        } catch (error) {
            return {success: false, message: error.message};
        }
    }

    async processForm(formElement, pythonFile = null, dataFile = null) {
        const formData = new FormData(formElement);
        let dataString = "";
        
        for (let [key, value] of formData.entries()) {
            dataString += key + ":" + value + "|-|-|-|-|";
        }

        const results = {};

        if (dataFile) {
            results.dataWrite = await this.sendData(dataFile, dataString + "\n");
        }

        if (pythonFile) {
            const dataObj = {};
            for (let [key, value] of formData.entries()) {
                dataObj[key] = value;
            }
            results.pythonExec = await this.runPython(pythonFile, dataObj);
        }

        return results;
    }

    formatDelimitedData(data) {
        let result = "";
        for (const [key, value] of Object.entries(data)) {
            result += key + ":" + value + "|-|-|-|-|";
        }
        return result;
    }
}

window.DataHandler = DataHandler;
