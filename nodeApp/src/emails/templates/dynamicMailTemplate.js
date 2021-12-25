module.exports = dynamicMailTemplate;

async function dynamicMailTemplate(extraHtml) {
    return `
        <h4>This is a test mail Dynamic</h4>
        <h5>Testing for email Attachments</h5>
        <br>
        <br>
        <br>
        <p></p>
        <p>Thanks</p>
        <p>Test person</p>
        ${extraHtml}
    `;
}
