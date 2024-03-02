
class WhatsAppController {

    webhookResponse(req, res) {
        const data = req.body;
        console.log(data);

        res.status(200).json({
            msg: "Webhook, Ok!!"
        })
    }
}

export { WhatsAppController }