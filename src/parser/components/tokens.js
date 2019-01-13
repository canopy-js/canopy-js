function TextToken(text, units) {
  this.text = text;
  this.type = 'text';
  this.units = units;
}

function LocalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text,
    units
  ) {
  this.text = text;
  this.type = 'local';
  this.targetSubtopic = targetSubtopic;
  this.targetTopic = targetTopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.units = units;
}

function GlobalReferenceToken(
    targetTopic,
    targetSubtopic,
    enclosingTopic,
    enclosingSubtopic,
    text,
    units
  ) {
  this.text = text;
  this.type = 'global';
  this.targetTopic = targetTopic;
  this.targetSubtopic = targetSubtopic;
  this.enclosingTopic = enclosingTopic;
  this.enclosingSubtopic = enclosingSubtopic;
  this.units = units;
}

export {
  LocalReferenceToken,
  GlobalReferenceToken,
  TextToken
};
