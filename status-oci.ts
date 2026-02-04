import { $ } from "bun";

const ociConfig = await Bun.file("oci-config.json").json();
const { compartmentId } = ociConfig;

const listResult = await $`oci container-instances container-instance list --auth security_token --compartment-id ${compartmentId} --display-name satisfactory-server --output json`.json() as { data: Array<{ id: string }> };

const INSTANCE_ID = listResult.data[0]?.id;

if (!INSTANCE_ID) {
  console.log("No container instance found with name 'satisfactory-server'");
  process.exit(0);
}

console.log("Container Instance:");
await $`oci container-instances container-instance get --auth security_token --container-instance-id ${INSTANCE_ID} --output json`.json();
