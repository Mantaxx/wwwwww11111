#include "TimelineNode.h"
#include "Components/WidgetComponent.h"
#include "Components/SceneComponent.h"

ATimelineNode::ATimelineNode()
{
    PrimaryActorTick.bCanEverTick = false;
    RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("Root"));

    WidgetComp = CreateDefaultSubobject<UWidgetComponent>(TEXT("WidgetComp"));
    WidgetComp->SetupAttachment(RootComponent);
    WidgetComp->SetRelativeLocation(FVector(0,0,120.f));
    WidgetComp->SetDrawSize(FVector2D(512,256));
    WidgetComp->SetWidgetSpace(EWidgetSpace::World);
}

void ATimelineNode::HandlePassedByPawn(APawn* PassingPawn)
{
    if (!bHasTriggered)
    {
        bHasTriggered = true;
        OnPassedByPawn(PassingPawn);
    }
}