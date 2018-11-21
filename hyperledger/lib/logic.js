/**
 * Sign a file
 * @param {org.example.mynetwork.Sign} sign - the sign to be processed
 * @transaction
 */
async function signFile(sign) {
    sign.file.signers.push(sign.signer);
    let assetRegistry = await getAssetRegistry('org.example.mynetwork.File');
    await assetRegistry.update(sign.file);
}