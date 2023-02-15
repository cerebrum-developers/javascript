<template>
  <div class="w-full">
    <v-main>
      <v-row justify="center" align="center">
        <v-container>
          <div class="flex justify-center mt-12">
            <div class="team-heading text-center">
              <div class="py-0 text-center">
                <h2
                  class="font-36 text-primary dark:text-white font-semibold mt-0 font-urbanist"
                >
                  Create Collection
                </h2>
                <p
                  class="font-18 font-medium text-primary dark:text-white mt-3 font-urbanist mb-2"
                >
                  Lorem Ipsum has been the industry's standard dummy text ever since the
                  1500s,
                </p>
              </div>
            </div>
          </div>
        </v-container>
      </v-row>
      <v-row justify="center" class="relative">
        <v-col cols="12" sm="6" md="8">
          <div class="w-full px-3 flex w-full">
            <div class="create-nft-form w-full">
              <v-form ref="form" lazy-validation class="w-full">
                <!-- TITLE SECTION -->
                <div class="w-full">
                  <label
                    for="title"
                    class="font-urbanist dark:text-white text-primary font-20 font-semibold"
                    >Collection Name
                  </label>
                  <v-text-field
                    v-model="collectionData.collection_name"
                    class="mt-2 bg-transparent"
                    background-color="transparent"
                    placeholder="Enter Collection Name"
                    required
                    outlined
                    solo
                    flat
                    :rules="validations.collectionNameRules"
                  ></v-text-field>
                </div>

                <!-- Banner Image UPLOAD -->
                <div class="w-full mb-8">
                  <label
                    for="dropzone"
                    class="font-urbanist dark:text-white text-primary font-20 font-semibold"
                    >Banner Image
                  </label>

                  <div
                    class="w-full bg-transparent my-2 py-8 px-5 border-2 rounded"
                    :class="
                      validations.isEmptyBannerImage
                        ? 'border-[#ff3939]'
                        : 'border-CBCBCB'
                    "
                  >
                    <div class="flex">
                      <div class="w-full flex align-center">
                        <p class="mb-0">PNG, JPG, GIF, WEBP or MP4 Max 100 MB</p>
                      </div>
                      <div class="w-auto">
                        <input
                          id="bannerInput"
                          ref="uploadFile"
                          type="file"
                          name="banner_image"
                          multiple=""
                          accept="image/jpeg, image/png"
                          v-on:input="onUploadBanner"
                          class="hidden"
                        />
                        <v-btn
                          class="px-1 px-lg-1 py-1 py-lg-1 btn-grad rounded-lg w-[189px]"
                          height="auto"
                          @click="focusBannerInput()"
                        >
                          <span
                            class="capitalize font-16 font-urbanist w-full h-full px-1 px-lg-1 py-3 rounded-lg"
                            >Upload</span
                          >
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Logo Image UPLOAD -->
                <div class="w-full mb-8">
                  <label
                    for="dropzone"
                    class="font-urbanist dark:text-white text-primary font-20 font-semibold"
                    >Logo Image
                  </label>

                  <div
                    class="w-full bg-transparent my-2 py-8 px-5 border-2 rounded"
                    :class="
                      validations.isEmptyLogoImage ? 'border-[#ff3939]' : 'border-CBCBCB'
                    "
                  >
                    <div class="flex">
                      <div class="w-full flex align-center">
                        <p class="mb-0">PNG, JPG, GIF, WEBP or MP4 Max 100 MB</p>
                      </div>
                      <div class="w-auto">
                        <input
                          id="logoInput"
                          ref="uploadFile"
                          type="file"
                          name="logo_image"
                          multiple=""
                          accept="image/jpeg, image/png"
                          v-on:input="onUploadLogo"
                          class="hidden"
                        />
                        <v-btn
                          class="px-1 px-lg-1 py-1 py-lg-1 btn-grad rounded-lg w-[189px]"
                          height="auto"
                          @click="focusLogoInput()"
                        >
                          <span
                            class="capitalize font-16 font-urbanist w-full h-full px-1 px-lg-1 py-3 rounded-lg"
                            >Upload</span
                          >
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Feature Image UPLOAD -->
                <div class="w-full mb-8">
                  <label
                    for="dropzone"
                    class="font-urbanist dark:text-white text-primary font-20 font-semibold"
                    >Feature Image
                  </label>

                  <div
                    class="w-full bg-transparent my-2 py-8 px-5 border-2 rounded"
                    :class="
                      validations.isEmptyFeatureImage
                        ? 'border-[#ff3939]'
                        : 'border-CBCBCB'
                    "
                  >
                    <div class="flex">
                      <div class="w-full flex align-center">
                        <p class="mb-0">PNG, JPG, GIF, WEBP or MP4 Max 100 MB</p>
                      </div>
                      <div class="w-auto">
                        <input
                          id="featureInput"
                          ref="uploadFile"
                          type="file"
                          name="feature_image"
                          multiple=""
                          accept="image/jpeg, image/png"
                          v-on:input="onUploadFeature"
                          class="hidden"
                        />
                        <v-btn
                          class="px-1 px-lg-1 py-1 py-lg-1 btn-grad rounded-lg w-[189px]"
                          height="auto"
                          @click="focusFeatureInput()"
                        >
                          <span
                            class="capitalize font-16 font-urbanist w-full h-full px-1 px-lg-1 py-3 rounded-lg"
                            >Upload</span
                          >
                        </v-btn>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DESCRIPTION SECTION -->
                <div class="w-full">
                  <label
                    for="description"
                    class="font-urbanist dark:text-white text-primary font-20 font-semibold"
                    >Description
                  </label>
                  <v-textarea
                    v-model="collectionData.description"
                    class="mt-2 bg-transparent"
                    height="200"
                    background-color="transparent"
                    placeholder="Enter Description"
                    required
                    outlined
                    solo
                    flat
                    no-resize
                    :rules="validations.descriptionRules"
                  >
                  </v-textarea>
                </div>

                <!-- Category SECTION -->
                <div class="w-full">
                  <label
                    for="collection"
                    class="font-urbanist dark:text-white text-primary font-20 font-semibold"
                    >Category
                  </label>
                  <v-select
                    v-model="collectionData.category"
                    class="mt-2"
                    :items="categories"
                    label="Select Category"
                    background-color="transparent"
                    item-text="category_name"
                    item-value="_id"
                    required
                    outlined
                    solo
                    flat
                    no-resize
                    :rules="validations.categoryRules"
                  >
                  </v-select>
                  <!-- <v-textarea class="mt-2 bg-transparent" height="200" background-color="transparent"
                                        placeholder="Enter Collection" required outlined solo flat no-resize>
                                    </v-textarea> -->
                </div>

                <!-- Create Earning SECTION -->
                <div class="w-full">
                  <label
                    for="title"
                    class="font-urbanist dark:text-white text-primary font-20 font-semibold"
                    >Create Earning
                  </label>
                  <v-text-field
                    v-model="collectionData.create_earning"
                    class="mt-2 bg-transparent"
                    background-color="transparent"
                    placeholder="Enter Earning"
                    required
                    outlined
                    solo
                    flat
                    :rules="validations.createEarningRules"
                  ></v-text-field>
                </div>

                <!-- Blockchain SECTION -->
                <div class="w-full">
                  <label
                    for="collection"
                    class="font-urbanist dark:text-white text-primary font-20 font-semibold"
                    >Blockchain
                  </label>
                  <v-select
                    v-model="collectionData.blockchain"
                    class="mt-2"
                    :items="blockchain"
                    label="Select Blockchain"
                    background-color="transparent"
                    item-text="category_name"
                    item-value="_id"
                    required
                    outlined
                    solo
                    flat
                    no-resize
                    :rules="validations.blockchainRules"
                  >
                  </v-select>
                  <!-- <v-textarea class="mt-2 bg-transparent" height="200" background-color="transparent"
                                        placeholder="Enter Collection" required outlined solo flat no-resize>
                                    </v-textarea> -->
                </div>

                <!-- Payment Tokens SECTION -->
                <div class="w-full">
                  <label
                    for="collection"
                    class="font-urbanist dark:text-white text-primary font-20 font-semibold"
                    >Payment Tokens
                  </label>
                  <v-select
                    v-model="collectionData.payment_tokens"
                    class="mt-2"
                    :items="paymentTokens"
                    label="Select Payment Tokens"
                    background-color="transparent"
                    item-text="payment_tokens"
                    item-value="_id"
                    required
                    outlined
                    solo
                    flat
                    no-resize
                    :rules="validations.paymentTokensRules"
                  >
                  </v-select>
                  <!-- <v-textarea class="mt-2 bg-transparent" height="200" background-color="transparent"
                                        placeholder="Enter Collection" required outlined solo flat no-resize>
                                    </v-textarea> -->
                </div>
              </v-form>
              <div class="lg:flex mt-3">
                <div class="div">
                  <v-btn
                    @click="validateForm()"
                    class="px-1 px-lg-1 py-1 py-lg-1 btn-grad rounded-lg w-[189px]"
                    height="auto"
                  >
                    <span
                      class="capitalize font-16 font-urbanist w-full h-full px-1 px-lg-1 py-3 rounded-lg"
                      >Create</span
                    >
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-main>
  </div>
</template>

<script>
export default {
  // middleware: 'auth',
  name: "CreateCollectionPage",
  data: () => ({
    categories: [],
    blockchain: [],
    paymentTokens: [],
    loading: false,
    selection: 1,
    user: {},
    collectionData: {
      collection_name: "",
      description: "",
      social_links: "",
      category: "",
      logo_image: [],
      banner_image: [],
      feature_image: [],
      create_earning: "",
      blockchain: "",
      payment_tokens: "",
      collaborators: "",
    },
    options: {
      url: "http://httpbin.org/anything",
      acceptedFiles: "image/*",
      autoProcessQueue: true,
    },
    url: "",
    validations: {
      isValidated: false,
      isEmptyLogoImage: false,
      isEmptyBannerImage: false,
      isEmptyFeatureImage: false,
      collectionNameRules: [
        (v) => !!v || "Collection Name is required",
        (v) => (v && v.length <= 50) || "Collection Name must be less than 50 characters",
      ],
      descriptionRules: [
        (v) => !!v || "Description is required",
        (v) => (v && v.length <= 500) || "Description must be less than 500 characters",
      ],
      categoryRules: [
        (v) => !!v || "Category is required",
        (v) => (v && v.length <= 50) || "Category must be less than 50 characters",
      ],
      blockchainRules: [
        (v) => !!v || "Blockchain is required",
        (v) => (v && v.length <= 50) || "Blockchain must be less than 50 characters",
      ],
      paymentTokensRules: [
        (v) => !!v || "Payment Tokens is required",
        (v) => (v && v.length <= 50) || "Payment Tokens must be less than 50 characters",
      ],
    },
  }),
  methods: {
    validateForm() {
      this.isValidated = true;
      this.collectionData.category = "test";
      this.collectionData.blockchain = "ETH";
      this.collectionData.payment_tokens = "Polygon";
      this.collectionData.collaborators = "Jhony";

      if (!this.collectionData.logo_image.length && !this.$refs.form.validate()) {
        this.validations.isEmptyLogoImage = true;
      }
      if (!this.collectionData.banner_image.length && !this.$refs.form.validate()) {
        this.validations.isEmptyBannerImage = true;
      }

      if (!this.collectionData.feature_image.length && !this.$refs.form.validate()) {
        this.validations.isEmptyFeatureImage = true;
      }

      if (this.$refs.form.validate()) {
        console.log("test2");
        this.storeCollection();
      }
      console.log("Fail");
      // this.storeCollection();
    },
    storeCollection() {
      console.log("this.collectionData", this.collectionData);
      this.$axios
        .$post("/v1/collections/", this.collectionData, {
          headers: {
            token: localStorage.getItem("authToken"),
          },
        })
        .then((response) => {
          this.$router.push("/explore");
          console.log(response);
        })
        .catch((error) => {
          console.log("Request canceled", error);
        });
    },
    focusBannerInput() {
      document.getElementById("bannerInput").click();
    },
    focusLogoInput() {
      document.getElementById("logoInput").click();
    },
    focusFeatureInput() {
      document.getElementById("featureInput").click();
    },
    onUploadLogo(event) {
		const _this = this;
      this.collectionData.logo_image = [];
      this.collectionData.logo_image.push({
        asset_type: "image",
        url: URL.createObjectURL(event.target.files[0]),
      });
      console.log("logo_image");
      const formData = new FormData();
      formData.append("asset", event.target.files[0]);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("authToken"),
        },
      };
      this.$axios
        .$post("/v1/assets", formData, config)
        .then((response) => {
          console.log("asset ", response.data);
          if (!response.success) {
            this.collectionData.logo_image = [];
          }
          this.collectionData.logo_image = response.data;
		  _this.validations.isEmptyLogoImage = false;
        })
        .catch((error) => {
          console.log("Request canceled", error);
        });
    },
    onUploadBanner(event) {
      const _this = this;
      this.collectionData.banner_image = [];
      this.collectionData.banner_image.push({
        asset_type: "image",
        url: URL.createObjectURL(event.target.files[0]),
      });
      console.log("banner_image");
      const formData = new FormData();
      formData.append("asset", event.target.files[0]);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("authToken"),
        },
      };
      this.$axios
        .$post("/v1/assets", formData, config)
        .then((response) => {
          console.log("asset ", response.data);
          if (!response.success) {
            this.collectionData.banner_image = [];
          }
          _this.validations.isEmptyBannerImage = false;
          this.collectionData.banner_image = response.data;
        })
        .catch((error) => {
          console.log("Request canceled", error);
        });
    },
    onUploadFeature(event) {
      const _this = this;
      this.collectionData.feature_image = [];
      this.collectionData.feature_image.push({
        asset_type: "image",
        url: URL.createObjectURL(event.target.files[0]),
      });
      console.log("feature_image");
      const formData = new FormData();
      formData.append("asset", event.target.files[0]);
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          token: localStorage.getItem("authToken"),
        },
      };
      this.$axios
        .$post("/v1/assets", formData, config)
        .then((response) => {
          console.log("asset ", response.data);
          if (!response.success) {
            this.collectionData.feature_image = [];
          }
          this.collectionData.feature_image = response.data;
          _this.validations.isEmptyFeatureImage = false;
        })
        .catch((error) => {
          console.log("Request canceled", error);
        });
    },
  },
  created() {},
  mounted() {
    // const instance = this.$refs.el.dropzone
  },
};
</script>
