#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "TimelineNode.generated.h"

class UWidgetComponent;

UCLASS()
class ATimelineNode : public AActor
{
    GENERATED_BODY()

public:
    ATimelineNode();

    // distance along spline where this node lives (world units)
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Node")
    float DistanceOnSpline = 0.f;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Node")
    int32 Year = 0;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Node")
    FText Title;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Node", meta=(MultiLine=true))
    FText CombinedDescription;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Node")
    FText CoeffAndTag;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Node")
    int32 Importance = 1;

    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Node")
    bool bHasTriggered = false;

    // Optional widget to display summary in world
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category="Node")
    UWidgetComponent* WidgetComp;

    // Blueprint event when passed by pawn
    UFUNCTION(BlueprintImplementableEvent, Category="Node")
    void OnPassedByPawn(APawn* PassingPawn);

    // C++ wrapper to fire once
    UFUNCTION()
    void HandlePassedByPawn(APawn* PassingPawn);
};