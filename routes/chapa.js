const express = require("express");
const cors = require("cors");
const router = express.Router();
const Chapa = require("chapa");

const chapaKey = "CHASECK-LGrL0zMgWROcgKr4IqHqS8cPfNaHoH03";

let myChapa = new Chapa(chapaKey);

router.use(cors());
router.post("/", async (req, res, next) => {
  const {
    first_name,
    amount,
    email = "a@gmail.com",
    phone_number,
    title = "ERCS Payment",
    return_url,
    description,
    currency,
  } = req.body;

  // Ensure title is max 16 characters for Chapa API validation
  const paymentTitle = (title || "ERCS Payment").substring(0, 16);

  const TEXT_REF = "tx-ERCS" + Date.now();

  // Properly format the return URL with query parameters
  const separator = return_url.includes('?') ? '&' : '?'
  const url = `${return_url}${separator}tx_ref=${TEXT_REF}`;

  // form data
  const customerInfo = {
    amount: amount,
    currency: currency,
    email: email,
    first_name: first_name,
    last_name: first_name,
    tx_ref: TEXT_REF,
    callback_url: "https://chapa.co",
    return_url: url,
    phone_number: phone_number || '0919870929',
    customization: {
      title: paymentTitle,
      // Description removed to avoid Chapa API validation errors
      // Only include description if it's short and valid (max 50 chars, alphanumeric with limited special chars)
    },
  };
  
  // Only add description if provided and meets Chapa requirements (max 50 chars, valid format)
  if (description && description.length <= 50 && /^[a-zA-Z0-9\s._-]+$/.test(description)) {
    customerInfo.customization.description = description;
  }

  console.log(customerInfo);

  fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: "Bearer CHASECK-LGrL0zMgWROcgKr4IqHqS8cPfNaHoH03",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customerInfo),
  })
    .then((res) => res.json()) // Parse response to JSON
    .then((response) => {
      console.log(response);
      response.tx_ref = TEXT_REF;
      return res.status(200).json({ response }); // Send the response properly
    })
    .catch((err) =>
      res.status(500).json({ error: "API Request Failed", details: err })
    );

  //   myChapa
  //     .initialize(customerInfo, { autoRef: true })
  //     .then((response) => {
  //       return res.status(200).json({
  //         response: response,
  //       });
  //     })
  //     .catch((e) => res.send(e));
});

router.post("/donation", async (req, res, next) => {
  console.log(res);
  const {
    first_name = "donator",
    amount,
    email = "a@gmail.com",
    phone_number = "",
    title = "ERCS Donation",
    return_url,
    description,
    currency,
  } = req.body;
  
  // Ensure title is max 16 characters for Chapa API validation
  const paymentTitle = (title || "ERCS Donation").substring(0, 16);
  
  const TEXT_REF = "tx-ERCS-DON" + Date.now();

  // Properly format the return URL with query parameters
  const separator = return_url.includes('?') ? '&' : '?'
  const url = `${return_url}${separator}tx_ref=${TEXT_REF}`;

  // form data
  const customerInfo = {
    amount: amount,
    currency: currency,
    email: email,
    first_name: first_name,
    last_name: first_name,
    tx_ref: TEXT_REF,
    callback_url: "https://chapa.co",
    return_url: url,
    phone_number: phone_number,
    customization: {
      title: paymentTitle,
      // Description removed to avoid Chapa API validation errors
      // Only include description if it's short and valid (max 50 chars, alphanumeric with limited special chars)
    },
  };
  
  // Only add description if provided and meets Chapa requirements (max 50 chars, valid format)
  if (description && description.length <= 50 && /^[a-zA-Z0-9\s._-]+$/.test(description)) {
    customerInfo.customization.description = description;
  }

  console.log(customerInfo);

  //   myChapa.initialize(customerInfo, { autoRef: true }).then(response => {

  //     console.log(response)
  //       return res.status(200).json({

  //          response:response
  //         });

  //   }).catch(e => res.send(e))
  fetch("https://api.chapa.co/v1/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: "Bearer CHASECK-LGrL0zMgWROcgKr4IqHqS8cPfNaHoH03",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(customerInfo),
  })
    .then((res) => res.json()) // Parse response to JSON
    .then((response) => {
      response.tx_ref = TEXT_REF;
      return res.status(200).json({ response }); // Send the response properly
    })
    .catch((err) =>
      res.status(500).json({ error: "API Request Failed", details: err })
    );
});

router.get("/verify-payment/:id", async (req, res, next) => {
  myChapa
    .verify(req.params.id)
    .then((response) => {
      return res.status(200).json({
        response: response,
      });
    })
    .catch((e) => res.send(e));
});

router.get("/test", async (req, res, next) => {
  res.send("hi");
});

module.exports = router;

// async/await
// let response = await myChapa.initialize(customerInfo, { autoRef: true })

// myChapa.verify('txn-reference').then(response => {
//     console.log(response) // if success
// }).catch(e => console.log(e)) // catch errors

// // async/await
// let response = await myChapa.verify('txn-reference')
