/**
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

let playButton;
let videoContent;
let adDisplayContainer;
let adsLoader;
let adsManager;
let playClicked;
let autoplayAllowed;
let autoplayRequiresMuted;

function init() {
  videoContent = document.getElementById('contentElement');
  playButton = document.getElementById('playButton');
  playButton.addEventListener('click', onPlayClicked);
  checkAutoplaySupport();
  setUpIMA();
}

function checkAutoplaySupport() {
  videoContent.play().then(onUnmutedAutoplaySuccess, onUnmutedAutoplayFail);
}

function onUnmutedAutoplaySuccess() {
  videoContent.pause();
  autoplayAllowed = true;
  autoplayRequiresMuted = false;
  requestAds();
}

function onUnmutedAutoplayFail() {
  checkMutedAutoplaySupport();
}

function checkMutedAutoplaySupport() {
  videoContent.volume = 0;
  videoContent.muted = true;
  videoContent.play().then(onMutedAutoplaySuccess, onMutedAutoplayFail);
}

function onMutedAutoplaySuccess() {
  videoContent.pause();
  autoplayAllowed = true;
  autoplayRequiresMuted = true;
  requestAds();
}

function onMutedAutoplayFail() {
  videoContent.volume = 1;
  videoContent.muted = false;
  autoplayAllowed = false;
  autoplayRequiresMuted = false;
  requestAds();
}

function setUpIMA() {
  adDisplayContainer = new google.ima.AdDisplayContainer(
      document.getElementById('adContainer'), videoContent);
  
  adsLoader = new google.ima.AdsLoader(adDisplayContainer);
  videoContent.onended = () => {adsLoader.contentComplete();};
  adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false);
  adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false);
}

function requestAds() {
  const adsRequest = new google.ima.AdsRequest();
  adsRequest.adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?' +
      'sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&' +
      'impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&' +
      'cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';
  adsRequest.setAdWillAutoPlay(autoplayAllowed);
  adsRequest.setAdWillPlayMuted(autoplayRequiresMuted);
  adsRequest.linearAdSlotWidth = 640;
  adsRequest.linearAdSlotHeight = 360;
  adsRequest.nonLinearAdSlotWidth = 640;
  adsRequest.nonLinearAdSlotHeight = 150;

  adsLoader.requestAds(adsRequest);
}

function onAdsManagerLoaded(adsManagerLoadedEvent) {
  const adsRenderingSettings = new google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  
  adsManager = adsManagerLoadedEvent.getAdsManager(
      videoContent, adsRenderingSettings);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  adsManager.addEventListener(
      google.ima.AdEvent.Type.LOADED,
      onAdLoaded);
  adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);
  if (playClicked || autoplayAllowed) {
    playAds();
  } else if (!autoplayAllowed) {
    playButton.style.display = 'block';
  }
}

function onContentPauseRequested() {
  videoContent.pause();
}

function onContentResumeRequested() {
  videoContent.play();
}

function onAdLoaded(adEvent) {
  if (adEvent.type == google.ima.AdEvent.Type.LOADED &&
      !adEvent.getAd().isLinear()) {
    videoContent.play();
  }
}

function onAdError(adErrorEvent) {
  console.log(adErrorEvent.getError());
  if (adsManager) {
    adsManager.destroy();
  }
  videoContent.play();
}

function onPlayClicked() {
  // videoContent.play();
  playClicked = true;
  if (adsManager) {
    playAds();
  }
}

function playAds() {
  adDisplayContainer.initialize();
  adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
  adsManager.start();
}

init();
